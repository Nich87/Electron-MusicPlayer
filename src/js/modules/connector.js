export class Notify {
    constructor(metadata) {
        this.metadata = metadata;
    }
    system() {
        return new Notification(this.metadata.title ?? '曲名が設定されていません', {
            body: this.metadata.artist ?? 'Unknown',
            silent: true,
            icon: this.metadata.image || '../Assets/Electunes.png'
        });
    }

    discord() {
        client.request('SET_ACTIVITY', {
            pid,
            activity: {
                state: `${this.metadata.artist?.slice(0, 128) ?? 'Unknown'}`,
                details: `${this.metadata.title?.slice(0, 128) ?? '曲名が設定されていません'}`,
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
}


