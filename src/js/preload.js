const { Howl } = require('howler');
const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
global.Howl = Howl;
global.ipcRenderer = ipcRenderer;
global.storage = storage;