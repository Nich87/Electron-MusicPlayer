const { app, BrowserWindow, Menu, dialog } = require('electron');
const storage = require('electron-json-storage');
const openAboutWindow = require('about-window').default;
const path = require('path');
const fs = require('fs');
const config = require('./config.json');
const encoder = new TextEncoder();

if (require('electron-squirrel-startup')) app.quit();
let mainWindow,filelist = [];

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
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

app.on('ready', () =>{
  createWindow();
  SetMenu(openFolder,information);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function SetMenu(openFolder,information) {
  const menu = Menu.buildFromTemplate([openFolder,information]);
  Menu.setApplicationMenu(menu);
}


function openFolderDialog() {
  dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }).then(
    (result) => {
      const filePath = result.filePaths[0];
      if (filePath) {
        storage.set('path', { path: filePath }, function (error) {
          if (error) throw error;
        });
        scanDir(filePath);
      }
    },
    (error) => {
      throw error;
    }
  );
}

function scanDir(filePath) {
  if(!filePath || filePath[0] === 'undefined') return;
  console.log(walkSync(filePath, filelist));
}

const walkSync = function (dir, filelist) {
  files = fs.readdirSync(dir);
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
    icon_path: path.join(__dirname, '../Electunes.png'),
    product_name: 'Electunes',
    homepage: 'https://github.com/Nich87/Electron-MusicPlayer',
    copyright: 'By Nich87',
    description: 'Simple Electron Music Player',
    license: 'MIT',
  });
}