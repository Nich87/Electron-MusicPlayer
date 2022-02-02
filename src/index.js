const { app, BrowserWindow, Menu, dialog } = require('electron');
const storage = require('electron-json-storage');
const path = require('path');
const config = require('./config.json');

if (require('electron-squirrel-startup')) app.quit();

let mainWindow;

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
  subMenu: [{
    label: 'Folder',
    id: 'folder',
    click: function () {
      openFolderDialog();
    }
  }]
};

app.on('ready', () =>{
  createWindow();
  SetMenu(openFolder);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function SetMenu(openFolder) {
  const menu = Menu.buildFromTemplate([openFolder]);
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
        console.log(filePath);
      }
    },
    (error) => {
      throw error;
    }
  );
}

