const {
    player_progress,btn_shuffle, btn_playpause, btn_repeat, current_time_text, duration_time_text,
    artwork,title,artist,album
} = await import('./elments.mjs');


export class MediaPlayer {
    constructor(queue, current,parser) {
        this.current_song = current;
        this.queue = queue;
        this.parser = parser;
        this.isLoop = false; //mode1
    }

    get current_time() {
        return this.current_song?.seek();
    }
    get isPlaying() {
        return this.current_song?.playing();
    }

    get current_index() {
        return this.queue.index(this.current_song?._src);
    }

    get metadata() {
        return this.parser.metadata(this.current_song?._src);
    }

    play() {
        this.current_song = new Howl({
            src: this.queue.items[0],
            autoplay: true,
            html5: true,
            preload: true,
            volume: 1,
            onload: async() => {
                const data = await this.metadata;
                artwork.src = data.image;
                title.textContent = data.title
                artist.textContent = data.artist;
                album.textContent = data.album;
                /* //TODO
                プレイリスト存在確認
                キュー更新
                */
            },
            onend: () => this.next_song(),
            onplay: () => {
                btn_playpause.classList.remove('fa-circle-play');
                btn_playpause.classList.add('fa-circle-pause');
                player_progress.max = this.current_song.duration() * 200;
                duration_time_text.textContent = seconds_to_time(this.current_song.duration());
                setInterval(() => {
                    player_progress.value = this.current_time * 200;
                    current_time_text.textContent = seconds_to_time(this.current_time);
                }, 16);
            },
            onpause: () => {
                btn_playpause.classList.remove('fa-circle-pause');
                btn_playpause.classList.add('fa-circle-play');
            }
        });
    }

    play_pause() {
        if (this.current_song.playing()) this.current_song.pause();
        else this.current_song.play();
    }


    stop() {
        this.current_song.stop();
        this.current_song.unload();
    }

    next_song() {
        if (this.queue.isEmpty) {
            artwork.src = '../Assets/Electunes.png';
            title.textContent = '';
            artist.textContent = '';
            album.textContent = '';
            current_time_text.textContent = '00:00';
            duration_time_text.textContent = '00:00';
            btn_playpause.classList.add('fa-circle-play');
            return console.warn('returned');
        }
        this.stop();
        this.isLoop ? this.queue.next() : this.queue.remove();
        this.play();
    }
    previous_song() {
        if (this.queue.isEmpty) return console.warn('returned');
        this.stop();
        this.queue.previous();
        this.play();
    }

    loop_state() {
        //TODO:one loop
        this.isLoop = !this.isLoop;
        this.isLoop ? btn_repeat.style.color = 'green' : btn_repeat.style.color = 'silver';
    }

    seek() {
        this.current_song.seek(player_progress.value /200);
    }

    // volume() {
    //     this.current_song?.volume(volume.value / 100);
    //     // g_volume = volume.value / 100;
    // }
}
