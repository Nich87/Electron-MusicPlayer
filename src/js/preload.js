const { ipcRenderer } = require('electron');
const { Howl } = require('howler');
const m = require('musicmetadata');


global.ipcRenderer = ipcRenderer;
global.Howl = Howl;
global.mm = m;