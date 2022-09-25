(async () => {
    const { MediaPlayer } = await import('./modules/media.js');
    const { Queue } = await import('./modules/queue.js');
    const { Parser } = await import('./modules/parser.js');
    const {
        player_progress, btn_shuffle, btn_previous, btn_playpause, btn_skip, btn_repeat
    } = await import('./modules/elments.mjs');

    let song,
    Player,
    queue = new Queue(),
    parser = new Parser();

    ipcRenderer.on('start', async (_args, filelist) => {
        queue.items = filelist;
        Player = new MediaPlayer(queue, song, parser);
        Player.play();
    });

    // Register event listeners
    btn_playpause.addEventListener('click', () => Player.play_pause());
    btn_skip.addEventListener('click', () => Player.next_song());
    btn_previous.addEventListener('click', () => Player.previous_song());
    btn_shuffle.addEventListener('click', () => queue.shuffle());
    btn_repeat.addEventListener('click', () => Player.loop_state());
    player_progress.addEventListener('input', () => Player.seek());

    //TODO:ボリュームバー作成
    // volume.addEventListener('input', () => Player.volume());


    /*ipcRenderer.on('mysongs', () => {
    reload();
    list = [];
    storage.getAll((error, data) => {
        if (error) throw error;
        Object.values(data).forEach(el => {
            Object.values(el).forEach(value => {
                if (!value) return;
                console.log(decodeURIComponent(atob(value)));
                list.push(decodeURIComponent(atob(value)));
            });
        });
        counter = 0;
        collection_init();
        play_next_song();
    });
});
        btn_favorite.addEventListener('click', () => {
            if (!current_song) return;
            const str = btoa(encodeURIComponent(current_song._src));
            storage.has(str, (err, hasKey) => {
                if (err) throw err;
                if (hasKey) {
                        storage.remove(str, (err) => {
                        if (err) throw err;
                        return btn_favorite.textContent = 'favorite_border';
                    });
                }
                storage.set(str, { Path: str }, (err) => {
                    if (err) throw err;
                    btn_favorite.textContent = 'favorite';
                });
            });
        });
        function favorite_load() {
            storage.has(btoa(encodeURIComponent(current_song._src)), (err, isfavorite) => {
                if (err) throw err;
                btn_favorite.textContent = isfavorite ? 'favorite' : 'favorite_border';
            });
        }
        */
})();