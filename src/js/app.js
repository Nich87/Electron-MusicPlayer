(() => { // Wrap with a function to avoid global pollution

    // HTML elements
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

    // Local variables
    let current_song, list = [], g_volume = 0.5;

    // Initialization
    M.AutoInit();
    ipcRenderer.on('start', (_args, filelist) => {
        if (current_song) {
            current_song.stop();
            current_song.unload();
        }
        list = filelist;
        collection_init();
        play_next_song();
    });
    ipcRenderer.on('mysongs', () => {
        if (current_song) {
            current_song.stop();
            current_song.unload();
        }
        list = [];
        storage.getAll((error, data) => {
            if (error) throw error;
            console.log(data);
            Object.values(data).forEach(el => {
                Object.values(el).forEach(value => {
                    if (!value) return;
                    console.log(decodeURIComponent(atob(value)));
                    list.push(decodeURIComponent(atob(value)));
                });
            });
            collection_init();
            play_next_song();
        });
    })
    .on('search', () => {
        search.style.display = search.style.display === 'none' ? '' : 'none';
    });

    // Register event listeners
    btn_play.addEventListener('click', () => {
        if (current_song.playing()) current_song.pause();
        else current_song.play();
    });

    btn_skip.addEventListener('click', () => {
        list.push(list.shift());
        update_collection_next();
        current_song.stop();
        current_song.unload();
        play_next_song();
    });

    btn_previous.addEventListener('click', () => {
        list.unshift(list.pop());
        update_collection_prev();
        current_song.stop();
        current_song.unload();
        play_next_song();
    });

    btn_forward.addEventListener('click', () => {
        current_song.seek(current_song.seek() + 10);
    });

    btn_replay.addEventListener('click', () => {
        current_song.seek(current_song.seek() - 10);
    });

    btn_shuffle.addEventListener('click', () => {
        current_song.unload();
        list = random(list);
        collection_init();
        play_next_song();
    });

    box.addEventListener('input', () => {
        if (!current_song) return;
        const str = box.value.toLowerCase();
        let pre = [];
        for (const song of list) {
            if (song.split('\\').pop().toLowerCase().indexOf(str) !== -1) {
                console.warn(song);
                pre.push(song);
            }
        }
        res.textContent = pre.length;

        while (results.firstChild) results.removeChild(results.firstChild);
        for (let i = 0; i < pre.length; i++) {
            const li = document.createElement('li');
            li.textContent = pre[i].split('\\').pop();
            results.appendChild(li);
        }
    });

    btn_favorite.addEventListener('click', () => {
        if (!current_song) return;
        const str = btoa(encodeURIComponent(current_song._src));
        storage.has(str, (error, hasKey) => {
            if (error) throw error;
            if (hasKey) {
                storage.remove(str, (error) => {
                    if (error) throw error;
                    btn_favorite.textContent = 'favorite_border';
                });
                return;
            }
            storage.set(str, { Path: str }, (error) => {
                if (error) throw error;
                btn_favorite.textContent = 'favorite';
            });
        });
    });

    player_progress.addEventListener('input', () => current_song.seek(player_progress.value / 200));
    volume.addEventListener('input', () => {
        current_song.volume(volume.value / 100);
        g_volume = volume.value / 100;
    });

    // Register interval
    setInterval(() => {
        if (!current_song?.playing()) return;
        const current_time = current_song.seek();
        player_progress.value = current_time * 200;
        const current = seconds_to_time(Math.trunc(current_time));
        current_time_text.textContent = current;
    }, 16);

    // Functions
    function play_next_song() {
        if (!list.length) return;
        current_song = new Howl({
            src: list[0],
            autoplay: true,
            html5: true,
            volume: g_volume,
            onload() {
                meta_parse();
                favorite_load();
                const duration = current_song.duration();
                player_progress.max = duration * 200;
                duration_time_text.textContent = seconds_to_time(Math.trunc(duration));
            },
            onend() {
                current_song.unload();
                list.push(list.shift());
                update_collection_next();
                play_next_song();
            },
            onplay: () => btn_play_inner.textContent = 'pause',
            onpause: () => btn_play_inner.textContent = 'play_arrow'
        });
    }

    async function meta_parse() {
        const metadata = await mm.parseFile(list[0]);
        /**
         * @param {String} bitrate
         * @param {String} bitsparsample
         * @param {Boolean} lossless
         * @param {String} sampleRate
         */
        const info = {
            bitrate: String(metadata.format.bitrate).slice(0, 3) + 'kbps',
            bitspersample: metadata.format.bitsPerSample + 'bit',
            lossless: metadata.format.lossless,
            sampleRate: metadata.format.sampleRate + 'Hz'
        };
        meta.style.display = '';
        const base64Data = metadata?.common.picture?.[0]?.data?.toString('base64');
        const imageUrl = base64Data ? 'data:image/png;base64,' + base64Data : '../Assets/no_image_square.jpg';
        artwork.src = imageUrl;

        title.textContent = metadata.common.title ?? '曲名が設定されていません';
        artist.textContent = metadata.common.artist ?? 'Unknown';
        album.textContent = metadata.common.album ?? 'Single';
        hires.style.display = info.lossless ? '' : 'none';

        new Notification(metadata.common.title ?? '曲名が設定されていません', {
            body: metadata.common.artist ?? 'Unknown',
            silent: true,
            icon: imageUrl
        });

        client.request('SET_ACTIVITY', {
            pid,
            activity: {
                state: `${metadata.common.artist?.slice(0, 128) ?? 'Unknown'}`,
                details: `${metadata.common.title?.slice(0, 128) ?? '曲名が設定されていません'}`,
                assets: {
                    large_image: 'f1c1ac57-07e7-4f99-8007-7dde646b551d',
                    large_text: '再生中'
                },
                buttons: [
                    { label: 'Download Electunes', url: 'https://github.com/Nich87/Electron-MusicPlayer' },
                    { label: 'Developer', url: 'https://twitter.com/const_root' }
                ],
                timestamps: {
                    start: Date.now()
                }
            }
        });
    }

    async function collection_init() {
        collection.textContent = '';
        for (let i = 0; i < Math.min(list.length, 30); i++) {
            const metadata = await mm.parseFile(list[i]);
            const li = document.createElement('li');
            li.className = 'collection-item avatar';
            const i_icon = document.createElement('i');
            i_icon.className = 'material-icons circle red';
            i_icon.textContent = 'audiotrack';
            const span = document.createElement('span');
            span.className = 'title';
            span.textContent = metadata.common.title ?? '曲名が設定されていません';
            const p_artists = document.createElement('p');
            p_artists.textContent = metadata.common.artist ?? 'Unknown';
            const p_albums = document.createElement('p');
            p_albums.textContent = metadata.common.album ?? 'Single';
            li.appendChild(i_icon);
            li.appendChild(span);
            li.appendChild(p_artists);
            li.appendChild(p_albums);
            collection.appendChild(li);
        }
        if (list.length) collection.firstElementChild.getElementsByTagName('i')[0].textContent = 'play_arrow';
    }

    function favorite_load() {
        storage.has(btoa(encodeURIComponent(current_song._src)), (err, isfavorite) => {
            if (err) throw err;
            btn_favorite.textContent = isfavorite ? 'favorite' : 'favorite_border';
        });
    }

    function update_collection_next() {
        const element = collection.firstElementChild;
        const element_inner = element.getElementsByTagName('i')[0];
        element_inner.textContent = 'audiotrack';
        collection.removeChild(element);
        collection.append(element);

        const next_element = collection.firstElementChild;
        const next_element_inner = next_element.getElementsByTagName('i')[0];
        next_element_inner.textContent = 'play_arrow';
    }

    function update_collection_prev() {
        const first_element = collection.firstElementChild;
        const last_element = collection.lastElementChild;

        const first_element_inner = first_element.getElementsByTagName('i')[0];
        first_element_inner.textContent = 'audiotrack';
        const last_element_inner = last_element.getElementsByTagName('i')[0];
        last_element_inner.textContent = 'play_arrow';

        collection.removeChild(last_element);
        collection.prepend(last_element);
    }
})();
