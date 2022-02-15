/* ---------------------Module import-------------------------- */
const { app, BrowserWindow, Menu, dialog } = require('electron');
const openAboutWindow = require('about-window').default;
if (require('electron-squirrel-startup')) app.quit();
const config = require('./config.json');
const mm = require('musicmetadata');
const path = require('path');
const fs = require('fs');
/* ---------------------Module import-------------------------- */

/* ---------------------  Initialize   -------------------------*/
let mainWindow,filelist = [];

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './js/preload.js'),
      contextIsolation: false
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  if (config.debug) mainWindow.webContents.openDevTools();
};


const openFolder = {
  label: 'Open Folder',
  click: openFolderDialog
};

const information = {
  label: 'Information',
  click: aboutApplication
}

/* ---------------------  Initialize  ------------------------- */

/* ---------------------Event listeners------------------------ */

app.on('ready', () =>{
  createWindow();
  SetMenu(openFolder,information);
})

.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* ---------------------Event listeners------------------------ */

/* ----------------------- Functions -------------------------- */

function SetMenu(openFolder,information) {
  const menu = Menu.buildFromTemplate([openFolder,information]);
  Menu.setApplicationMenu(menu);
}


function openFolderDialog() {
  dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }).then(
    (result) => {
      const filePath = result.filePaths[0];
      if (filePath) scanDir(filePath);
    },
    (error) => {
      throw error;
    }
  );
}

function scanDir(filePath) {
  if(!filePath || filePath[0] === 'undefined') return;
  walkSync(filePath, filelist);
  play();
}

const walkSync = function (dir, filelist) {
  files = fs.readdirSync(dir,'utf8');
  filelist = filelist || [];
  files.forEach(function (file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      if (file.endsWith('.mp3') ||
      file.endsWith('.wav')||
      file.endsWith('.flac')||
      file.endsWith('.ogg')||
      file.endsWith('.aac')||
      file.endsWith('.m4a')||
      file.endsWith('.wma')||
      file.endsWith('.alac')||
      file.endsWith('.webm')
      ) filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

function aboutApplication() {
  openAboutWindow({
    icon_path: path.join(__dirname, '../Assets/Electunes.png'),
    product_name: 'Electunes',
    homepage: 'https://github.com/Nich87/Electron-MusicPlayer',
    copyright: 'By Nich87',
    description: 'Simple Electron Music Player',
    license: 'MIT',
  });
}


const play = () => {
  let json = {...filelist};
  json = Object.assign({},filelist);
  json = filelist.reduce((json, value, key) =>{json[key] = value; return json;},{});
  mainWindow.webContents.send('start',json);
}
/* ----------------------- Functions -------------------------- */