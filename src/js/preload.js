//Electron
const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
const os = require('os');
storage.setDataPath(os.homedir() + '/playlist/');

//Discord lib
const rpc = require('discord-rpc');
const client = new rpc.Client({ transport: 'ipc' });
client.login({ clientId: '952501026584416337' });

//Audio lib
const { Howl } = require('howler');
const metadata = require('music-metadata-browser');

//etc Fns
const { seconds_to_time } = require('../../Util/convert');
const random = require('../../Util/random');

//Global variables
global.ipcRenderer = ipcRenderer;
global.Howl = Howl;
global.mm = metadata;
global.storage = storage;
global.seconds_to_time = seconds_to_time;
global.random = random;
global.client = client;
global.pid = process.pid;
