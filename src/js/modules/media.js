const {
    player_progress,btn_shuffle, btn_playpause, btn_repeat, current_time_text, duration_time_text,
    artwork,title,artist,album,song_title
} = await import('./elments.mjs');
const { Notify } = await import('./connector.js');

export class MediaPlayer {
    constructor(queue, current,parser) {
        this.current_song = current;
        this.queue = queue;
        this.parser = parser;
        this.isLoop = false;
        this.interval = null;
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
                song_title.textContent = data.title;
                title.textContent = data.title
                artist.textContent = data.artist;
                album.textContent = data.album;
                const notify = new Notify(data);
                notify.system();
                notify.discord();
                //TODO:お気に入り機能実装時、お気に入りかをチェック
            },
            onend: () => {
                clearInterval(this.interval);
                this.next_song();
            },
            onplay: () => {
                btn_playpause.classList.remove('fa-circle-play');
                btn_playpause.classList.add('fa-circle-pause');
                player_progress.max = this.current_song.duration() * 200;
                duration_time_text.textContent = seconds_to_time(this.current_song.duration());
                this.interval = setInterval(() => {
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
        clearInterval(this.interval)
    }

    init() {
        artwork.src = '../Assets/Electunes.png';
        player_progress.value = 0;
        song_title.textContent = 'Electunes';
        title.textContent = '';
        artist.textContent = '';
        album.textContent = '';
        current_time_text.textContent = '00:00';
        duration_time_text.textContent = '00:00';
        btn_playpause.classList.add('fa-circle-play');
    }

    next_song() {
        this.stop();
        this.isLoop ? this.queue.next() : this.queue.remove();
        if (this.queue.isEmpty) return this.init();
        this.play();
    }
    previous_song() {
        if (this.queue.isEmpty) return console.warn('returned');
        this.stop();
        this.queue.previous();
        this.play();
    }

    loop_state() {
        //TODO:単曲リピート実装
        this.isLoop = !this.isLoop;
        this.isLoop ? btn_repeat.style.color = 'green' : btn_repeat.style.color = 'silver';
    }

    seek() {
        this.current_song.seek(player_progress.value /200);
    }

    volume(value) {
        //this.current_song?.volume(value / 100);
        // g_volume = value / 100;
    }
}
