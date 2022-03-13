(() => { // Wrap with a function to avoid global pollution

    // HTML elements
    const player_progress = document.getElementById('player-progress');
    const btn_play = document.getElementById('btn_play');
    const btn_skip = document.getElementById('btn_skip');
    const btn_previous = document.getElementById('btn_previous');
    const btn_forward = document.getElementById('btn_forward');
    const btn_replay = document.getElementById('btn_replay');
    const btn_shuffle = document.getElementById('btn_shuffle');
    const btn_play_inner = btn_play.getElementsByTagName('i')[0];
    const current_time_text = document.getElementById('current');
    const duration_time_text = document.getElementById('duration');
    const artwork = document.getElementById('artwork');
    const volume = document.getElementById('volume');
    const collection = document.getElementById('Music_list');
    const meta = document.getElementById('metadata');

    // Local variables
    let current_song, list, g_volume = 0.5;

    // Initialization
    M.AutoInit();
    ipcRenderer.on('start', (_args, filelist) => {
        if(current_song) {
            current_song.stop();
            current_song.unload();
            list = null;
        }
        filelist = Object.values(filelist);
        console.log(filelist);
        list = filelist;
        play_next_song();
    });

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
            autoplay: true,
            html5: true,
            volume: g_volume,
            onload() {
                collection_init();
                meta_parse();
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
        let code = `
        <li class="collection-item" id="title">${metadata.common.title ?? '曲名が設定されていません'}</li>
        <li class="collection-item" id="artist">${metadata.common.artist ?? 'Unknown'}</li>
        <li class="collection-item" id="album">${metadata.common.album ?? 'Single'}</li>
        `;
        if (info.lossless) code += '<img src="../Assets/hires-logo.png" id="hires">';
        meta.insertAdjacentHTML('beforeend', code);
        const base64Data = metadata?.common.picture?.[0]?.data?.toString('base64');
        const imageUrl = base64Data ? 'data:image/png;base64,' + base64Data : "../Assets/no_image_square.jpg";
        artwork.src = imageUrl;

        new Notification(metadata.common.title ?? '曲名が設定されていません', {
            body: metadata.common.artist ?? 'Unknown',
            silent: true,
            icon: imageUrl
        });

        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
                state: '再生中',
                details: `${metadata.common.title}`,
                assets: {
                    large_image: 'f1c1ac57-07e7-4f99-8007-7dde646b551d',
                    large_text: "NowPlaying"
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
            const listCode = `
            <li class="collection-item avatar">
            <i class="material-icons circle red">audiotrack</i>
            <span class="title">${metadata.common.title ?? '曲名が設定されていません'}</span>
            <p>${metadata.common.artist ?? 'Unknown'}</p>
            <p>${metadata.common.album ?? 'Single'}</p>
            </li>
            `;
            collection.insertAdjacentHTML('beforeend', listCode);
            const collection_inner = collection.getElementsByTagName('i')[0];
            collection_inner.textContent = 'play_arrow';
        }
    }
})();