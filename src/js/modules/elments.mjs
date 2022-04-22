const player_progress = document.getElementById('player-progress');
const btn_play = document.getElementById('button-play');
const btn_skip = document.getElementById('button-skip');
const btn_previous = document.getElementById('button-previous');
const btn_forward = document.getElementById('button-forward');
const btn_replay = document.getElementById('button-replay');
const btn_favorite = document.getElementById('button-favorite');
const btn_shuffle = document.getElementById('button-shuffle');
const btn_play_inner = btn_play.getElementsByTagName('i')[0];
const current_time_text = document.getElementById('current');
const duration_time_text = document.getElementById('duration');
const artwork = document.getElementById('artwork');
const volume = document.getElementById('volume');
const collection = document.getElementById('music-list');
const meta = document.getElementById('metadata');
const search = document.getElementById('search-box');
const box = document.getElementById('textarea1');
const res = document.getElementById('res-value');
const results = document.getElementById('results');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const album = document.getElementById('album');
const hires = document.getElementById('hires');

export {
    player_progress, btn_play, btn_skip, btn_previous, btn_forward, btn_replay, btn_favorite, btn_shuffle, btn_play_inner, current_time_text, duration_time_text
    , artwork, volume, collection, meta, search, box, res, results, title, artist, album, hires
};