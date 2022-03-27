/* ---------------------Module import-------------------------- */
const { app, BrowserWindow, Menu, dialog } = require('electron');
const openAboutWindow = require('about-window').default;
if (require('electron-squirrel-startup')) app.quit();
const config = require('./config.json');
const path = require('path');
const fs = require('fs');
/* ---------------------Module import-------------------------- */

/* ---------------------  Initialize   -------------------------*/
const exts = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'alac', 'webm']
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './js/preload.js'),
      contextIsolation: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  if (config.debug) mainWindow.webContents.openDevTools();
}

const openFolder = {
  label: 'Open Folder',
  click: openFolderDialog
};

const information = {
  label: 'Information',
  click: aboutApplication
};

const openSearch = {
  label: 'Search',
  click: openSearchDialog
};

const switchTheme = {
  label: 'Theme',
  click: changeTheme
};

const mySong = {
  label: 'My Songs',
  click: playMySongs
};
/* ---------------------  Initialize  ------------------------- */

/* ---------------------Event listeners------------------------ */

app.on('ready', () => {
  createWindow();
  SetMenu();
})

.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* ---------------------Event listeners------------------------ */

/* ----------------------- Functions -------------------------- */

function SetMenu() {
  const menu = Menu.buildFromTemplate([openFolder, mySong, openSearch, switchTheme, information]);
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
  if (!filePath || filePath[0] === 'undefined') return;
  mainWindow.webContents.send('start', walkSync(filePath));
}

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir, 'utf8');
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) return walkSync(filepath, filelist);
    const ext = file.slice(file.lastIndexOf('.'));
    if (exts.includes(ext)) filelist.push(filepath);
  });
  return filelist;
}

function openSearchDialog() {
  mainWindow.webContents.send('search');
}

function changeTheme() {

}

function playMySongs() {
  mainWindow.webContents.send('mysongs');
}

function aboutApplication() {
  openAboutWindow({
    icon_path: path.join(__dirname, '../Assets/Electunes.png'),
    product_name: 'Electunes',
    homepage: 'https://github.com/Nich87/Electron-MusicPlayer',
    copyright: 'By Nich87',
    description: 'Simple Electron Music Player',
    license: 'MIT'
  });
}

/* ----------------------- Functions -------------------------- */
