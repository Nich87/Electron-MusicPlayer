/* ---------------------Module import-------------------------- */
const { app, BrowserWindow, Menu, dialog } = require('electron');
const openAboutWindow = require('about-window').default;
if (require('electron-squirrel-startup')) app.quit();
const path = require('path');
const fs = require('fs');
if (!app.isPackaged) require("electron-reload")(__dirname, {
  electron: require(`${__dirname}/../node_modules/electron`)
});
/* ---------------------Module import-------------------------- */

/* ---------------------  Initialize   -------------------------*/
const exts = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'alac', 'webm']
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './js/preload.js'),
      contextIsolation: false,
      sandbox: false
    },
    alwaysOnTop: true,
    icon: "Assets/Electunes.png"
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  if (!app.isPackaged) mainWindow.webContents.openDevTools();
}

const openFolder = {
  label: 'File',
  submenu: [
    {
      label: 'フォルダを開く',
      click: openFolderDialog
    }
  ]
};

const information = {
  label: 'Information',
  submenu: [
    {
      label: 'このアプリについて',
      click: aboutApplication
    }, {
      label: '開発に参加する'
    }
  ]
};

const openSearch = {
  label: 'Search',
  submenu: [
    {
      label: '曲名で探す'
    }, {
      label: 'アーティスト名で探す'
    }, {
      label: 'アルバム名で探す'
    }
  ]
  //click: openSearchDialog
};

const switchTheme = {
  label: 'Theme',
  submenu: [
    {
      label: 'ライトテーマ',
      click: changeTheme
    }, {
      label: 'ダークテーマ',
      click: changeTheme
    }, {
      label: 'Discordテーマ',
      click: changeTheme
    }
  ]
};

//TODO:プレイリストフォルダの数に応じて項目を増やす
const mySong = {
  label: 'Playlist',
  submenu: [
    {
      label: 'いいねした曲', //default playlist
      click: playMySongs //ex. playMySongs(classic-playlist)
    }
  ]
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
    const ext = file.slice(file.lastIndexOf('.') + 1);
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
