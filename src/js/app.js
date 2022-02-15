(() => { // Wrap with a function to avoid global pollution


    // HTML elements
    const play_btn = document.getElementById('btn_play');
    const skip = document.getElementById('btn_skip');
    const previous = document.getElementById('btn_previous');
    const player_progress = document.getElementById('player-progress');
    const artwork = document.getElementById('artwork');
    const current_time_text = document.getElementById('current');
    const play_btn_inner = play_btn.getElementsByTagName('i')[0];
    const title = document.getElementById('title');
    const artist = document.getElementById('artist');
    const album = document.getElementById('album');
    const volume = document.getElementById('volume');
    const collection = document.getElementById('Music_list');
    //const collection_Top = document.getElementById('NowPlaying');

    // Local variables
    let current_song, list;



    // Initialization
    M.AutoInit();
    ipcRenderer.on('start', (_args, filelist) => {
        filelist = Object.values(filelist);
        console.log(filelist);
        list = filelist;
        collection_init();
        play_next_song();
    });

    // Register event listeners
    play_btn.addEventListener('click', () => {
        if (current_song.playing()) current_song.pause();
        else current_song.play();
    });

    skip.addEventListener('click', () => {
        list.push(list.shift());
        current_song.unload();
        play_next_song();
        console.log('skip');
    });

    previous.addEventListener('click', () => {
        list.unshift(list.pop());
        current_song.unload();
        play_next_song();
        console.log('previous');
    });

    player_progress.addEventListener('input', () => current_song.seek(player_progress.value / 200));
    volume.addEventListener('input', () => current_song.volume(volume.value / 100));



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
            loop: true,
            autoplay: true,
            html5: true,
            onload: () => {
                meta_parse();
                collection_init();
                const duration = current_song.duration();
                player_progress.max = duration * 200;
            },
            onend: () => {
                current_song.unload();
                list.push(list.shift());
                play_next_song();
            },
            onplay: () => play_btn_inner.textContent = 'pause',
            onpause: () => play_btn_inner.textContent = 'play_arrow',
        });
    }

    function meta_parse() {
        musicmetadata(fs.createReadStream(list[0]), (err, metadata) => {
            if (err) return console.log(`${err}\n${err.stack.split('\n')[1]}`);
            console.log(metadata)
            title.textContent = metadata.title || '曲名が設定されていません';
            artist.textContent = metadata.artist[0] || 'Unknown';
            album.textContent = metadata.album || 'Single';
            const base64Data = metadata?.picture?.[0]?.data?.toString('base64');
            if (base64Data) artwork.src = 'data:image/png;base64,' + base64Data;
            else artwork.src = "https://1.bp.blogspot.com/-D2I7Z7-HLGU/Xlyf7OYUi8I/AAAAAAABXq4/jZ0035aDGiE5dP3WiYhlSqhhMgGy8p7zACNcBGAsYHQ/s1600/no_image_square.jpg";
        });
    }

    function collection_init() {
        collection.innerHTML="";
        for(let i = 0; i<10; i++){
            musicmetadata(fs.createReadStream(list[i]), (err, metadata) => {
                if (err) return console.log(`${err}\n${err.stack.split('\n')[1]}`);
                let listCode = `
                <li class="collection-item avatar">
                <i class="material-icons circle red">audiotrack</i>
                <span class="title">${metadata.title || '曲名が設定されていません'}</span>
                <p>${metadata.artist[0] || 'Unknown'}</p>
                <p>${metadata.album || 'Single'}</p>
                </li>
                `;
                collection.insertAdjacentHTML('beforeend',listCode);
        });
    }
}
})();