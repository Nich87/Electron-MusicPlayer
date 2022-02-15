const { ipcRenderer } = require('electron');
const { Howl } = require('howler');
const musicmetadata = require('musicmetadata');
const { seconds_to_time } = require('../../Util/convert');
const fs = require('fs');

global.ipcRenderer = ipcRenderer;
global.Howl = Howl;
global.musicmetadata = musicmetadata;
global.seconds_to_time = seconds_to_time;
global.fs = fs;