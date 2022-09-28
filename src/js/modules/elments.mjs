const player_progress = document.getElementById('player-progress');

const btn_shuffle = document.getElementById('shuffle');
const btn_previous = document.getElementById('backward');
const btn_playpause = document.getElementById('playpause');
const btn_skip = document.getElementById('forward');
const btn_repeat = document.getElementById('repeat');

const btn_favorite = document.getElementById('button-favorite');
const current_time_text = document.getElementById('current');
const duration_time_text = document.getElementById('duration');

const artwork = document.getElementsByClassName('artwork')[0];
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const album = document.getElementById('album');

const song_title = document.getElementById('song-title');

export {
player_progress,btn_shuffle,btn_previous,btn_playpause,btn_skip,btn_repeat,current_time_text,duration_time_text,
artwork,title,artist,album,song_title
};