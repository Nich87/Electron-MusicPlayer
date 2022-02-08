const { ipcRenderer } = require('electron');
const { Howl } = require('howler');
const m = require('musicmetadata');
const {seconds_to_time} = require('../../Util/convert');
const fs = require('fs');

global.ipcRenderer = ipcRenderer;
global.Howl = Howl;
global.mm = m;
global.convert = seconds_to_time;
global.fs = fs;