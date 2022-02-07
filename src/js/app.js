let player, list, isLoading = false;
M.AutoInit();

ipcRenderer.on('start', (args, filelist) => {
    filelist = Object.values(filelist);
    console.log(filelist);
    list = filelist;
    if (isLoading) {
        player.unload();
        isLoading = false;
    }
    Maker(list);
});

function Maker(list) {
    player = new Howl({
        src: list[0],
        loop: true,
        autoplay: true
    });
    player.on('end', () => {
        console.debug('end');
        player.unload();
        list.push(list.shift());
        Maker(list);
    });
    player.on('play', () => play(player));
    isLoading = true;
}

function play(player) {
    const player_bt = document.getElementById('btn_play');
    const skip = document.getElementById('btn_skip');
    const previous = document.getElementById('btn_previous');
    player_bt.addEventListener('click', (event) => {
        if (player.playing()) {
            event.target.innerText = 'play_arrow';
            player.pause();
        }
        else {
            event.target.innerText = 'pause';
            player.play();
        }
    });

    skip.addEventListener('click', () => {
        list.push(list.shift());
        player.unload();
        Maker(list);
        console.log(list);
    });

    previous.addEventListener('click', () => {
        list.unshift(list.pop());
        player.unload();
        Maker(list);
        console.log(list)
    });
}