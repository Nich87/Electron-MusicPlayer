let player, list;
M.AutoInit();

ipcRenderer.on('start', (args, filelist) => {
    filelist = Object.values(filelist);
    console.log(filelist);
    list = filelist;
    Maker(list);
});

function Maker(list) {
    player = new Howl({
        src: list[0],
        loop: true,
        autoplay: true,
        html5:true,
        loop: true,
        onload: () => play(player),
        onend: () => {
            player.unload();
            list.push(list.shift());
            Maker(list);
        }
    });
}

function play(player) {
    const player_bt = document.getElementById('btn_play');
    const skip = document.getElementById('btn_skip');
    const previous = document.getElementById('btn_previous');
    setInterval("nowplaying(player)", 1000);
    meta_parse();
    setTimeout(() => {
        setInterval("seek()", 430);
    }, 3000);

    player_bt.addEventListener('click', (e) => {
        e.target.innerHTML = player.playing() ? 'play_arrow' : 'pause';
        e.target.innerHTML === 'pause' ? player.play() : player.pause();
    });

    skip.addEventListener('click', () => {
        list.push(list.shift());
        player.unload();
        Maker(list);
        console.log('skip');
    });

    previous.addEventListener('click', () => {
        list.unshift(list.pop());
        player.unload();
        Maker(list);
        console.log('previous');
    });
}

function nowplaying(player) {
    const current = convert(Math.trunc(player.seek()));
    const currentTime = document.getElementById('current').innerHTML = current;
    const progress = document.getElementById('player-progress');
    progress.max = player.duration();
    progress.value = player.seek();
}

function meta_parse() {
    mm(fs.createReadStream(list[0]), function (err, metadata) {
        if (err) throw err;
        console.log(metadata.picture[0].data);
        document.getElementById('artwork').src = 'data:image/png;base64,' + metadata.picture[0].data.toString('base64');
    });
}

function seek() {
    const p = document.getElementById('player-progress').value;
    if(convert(Math.trunc(player.seek())) !== convert(Math.trunc(p))) player.seek(p);
}