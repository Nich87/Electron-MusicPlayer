(() => { // Wrap with a function to avoid global pollution

    // HTML elements
    const player_progress = document.getElementById('player-progress');
    const btn_play = document.getElementById('btn_play');
    const btn_skip = document.getElementById('btn_skip');
    const btn_previous = document.getElementById('btn_previous');
    const btn_forward = document.getElementById('btn_forward');
    const btn_replay = document.getElementById('btn_replay');
    const btn_favorite = document.getElementById('btn_favorite');
    const btn_shuffle = document.getElementById('btn_shuffle');
    const btn_play_inner = btn_play.getElementsByTagName('i')[0];
    const current_time_text = document.getElementById('current');
    const duration_time_text = document.getElementById('duration');
    const artwork = document.getElementById('artwork');
    const volume = document.getElementById('volume');
    const collection = document.getElementById('Music_list');
    const meta = document.getElementById('metadata');
    const search = document.getElementById('search');


    // Local variables
    let current_song, list=[], g_volume = 0.5, isShowing = false;

    // Initialization
    M.AutoInit();
    ipcRenderer.on('start', (_args, filelist) => {
        if(current_song) {
            current_song.stop();
            current_song.unload();
            list = [];
        }
        filelist = Object.values(filelist);
        list = filelist;
        play_next_song();
    })
    ipcRenderer.on('mysongs', () => {
            if (current_song) {
                current_song.stop();
                current_song.unload();
                list = [];
            }
            storage.getAll((error, data) => {
                if (error) throw error;
                console.log(data);
                Object.values(data).forEach(el => {
                    Object.values(el).forEach(value => {
                            console.log(atob(value));
                            list.push(atob(value));
                            if (list.length === fs.readdirSync(os.homedir() + '/playlist/').length) return play_next_song();
                    });
                });
            });
        })
    .on('search',() => {
        if(!isShowing){
        search.insertAdjacentHTML('beforeend', `
        <div class="row" id="search">
        <form class="col s12">
        <div class="row">
        <div class="input-field col s12">
        <textarea id="textarea1" class="materialize-textarea"></textarea>
        <label for="textarea1">検索ワードを入力してください</label>
        </div>
        </div>
        </form>
        </div>
        `);
        isShowing = true;
        } else {
            search.removeChild(search.lastElementChild);
            isShowing = false;
        }
    })

    // Register event listeners
    btn_play.addEventListener('click', () => {
        if (current_song.playing()) current_song.pause();
        else current_song.play();
    });

    btn_skip.addEventListener('click', () => {
        list.push(list.shift());
        current_song.stop();
        current_song.unload();
        play_next_song();
    });

    btn_previous.addEventListener('click', () => {
        list.unshift(list.pop());
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
        play_next_song();
    });

    btn_favorite.addEventListener('click', () => {
        if (!current_song) return;
        const str = btoa(current_song._src);
        storage.has(str, (error, hasKey) => {
            if (error) throw error;
            if (hasKey) {
                storage.remove(str, (error) => {
                    if (error) throw error;
                });
            } else {
                storage.set(str, { Path: str },(error) => {
                    if (error) throw error;
                });
            }
        });
        favorite_load();
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
        current_song = new Howl({
            src: list[0],
            format: ['mp3', 'wav','flac','ogg','acc','m4a','wma','alac','webm','dolby'],
            autoplay: true,
            html5: true,
            volume: g_volume,
            onload() {
                collection_init();
                meta_parse();
                favorite_load();
                const duration = current_song.duration();
                player_progress.max = duration * 200;
                duration_time_text.textContent = seconds_to_time(Math.trunc(duration));
            },
            onend() {
                current_song.unload();
                list.push(list.shift());
                play_next_song();
            },
            onplay: () => btn_play_inner.textContent = 'pause',
            onpause: () => btn_play_inner.textContent = 'play_arrow',
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
        while (meta.lastChild) meta.removeChild(meta.lastChild);
        const base64Data = metadata?.common.picture?.[0]?.data?.toString('base64');
        const imageUrl = base64Data ? 'data:image/png;base64,' + base64Data : "../Assets/no_image_square.jpg";
        artwork.src = imageUrl;

        let title = document.createElement('li')
        title.id = 'title'
        title.className = 'collection-item'
        title.textContent = metadata.common.title ?? '曲名が設定されていません';

        let artist = document.createElement('li')
        artist.id = 'artist'
        artist.className = 'collection-item'
        artist.textContent = metadata.common.artist ?? 'Unknown';

        let album = document.createElement('li')
        album.id = 'album'
        album.className = 'collection-item'
        album.textContent = metadata.common.album ?? 'Single';

        meta.appendChild(title);
        meta.appendChild(artist);
        meta.appendChild(album);
        if (info.lossless) meta.insertAdjacentHTML('beforeend', '<img src="../Assets/hires-logo.png" id="hires">');

        new Notification(metadata.common.title ?? '曲名が設定されていません', {
            body: metadata.common.artist ?? 'Unknown',
            silent: true,
            icon: imageUrl
        });

        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
                state: `${metadata.common.artist.slice(0,128) ?? 'Unknown'}`,
                details: `${metadata.common.title.slice(0, 128) ?? '曲名が設定されていません'}`,
                assets: {
                    large_image: 'f1c1ac57-07e7-4f99-8007-7dde646b551d',
                    large_text: "再生中"
                },
                buttons: [
                    { label: 'Download Electunes', url: 'https://github.com/Nich87/Electron-MusicPlayer'},
                    { label: 'Developer', url:'https://twitter.com/const_root'},
                ],
                timestamps:{
                    start: Date.now(),
                }
            }
        });
    }

    async function collection_init() {
        while (collection.lastChild) collection.removeChild(collection.lastChild);
        for (let i = 0; i < Math.min(list.length, 30); i++) {
            const metadata = await mm.parseFile(list[i]);
            let li = document.createElement('li');
            li.className = 'collection-item avatar';
            let i_icon = document.createElement('i');
            i_icon.className = 'material-icons circle red';
            i_icon.textContent = 'audiotrack';
            let span = document.createElement('span');
            span.className = 'title';
            span.textContent = metadata.common.title ?? '曲名が設定されていません';
            let p_artists = document.createElement('p');
            p_artists.textContent = metadata.common.artist ?? 'Unknown';
            let p_albums = document.createElement('p');
            p_albums.textContent = metadata.common.album ?? 'Single';
            li.appendChild(i_icon);
            li.appendChild(span);
            li.appendChild(p_artists);
            li.appendChild(p_albums);
            collection.appendChild(li);
            const collection_inner = collection.getElementsByTagName('i')[0];
            collection_inner.textContent = 'play_arrow';
        }
    }

    function favorite_load() {
        storage.has(current_song._src, (err, isfavorite) => {
            isfavorite ? btn_favorite.textContent = 'favorite' : btn_favorite.textContent = 'favorite_border';
        });
    }
})();

