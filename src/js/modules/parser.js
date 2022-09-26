export class Parser {
    async metadata (path) {
        const metadata = await mm.fetchFromUrl(path);
        const base64Data = metadata?.common.picture?.[0]?.data?.toString('base64');
        const imageUrl = base64Data ? 'data:image/png;base64,' + base64Data : '../Assets/no_image_square.jpg';

        return {
            image:imageUrl,
            title: metadata.common.title ?? '曲名が設定されていません',
            artist: metadata.common.artist ?? 'Unknown',
            album: metadata.common.album ?? 'Single',
            bitrate: String(metadata.format.bitrate).slice(0, 3) + 'kbps',
            bitspersample: metadata.format.bitsPerSample + 'bit',
            lossless: metadata.format.lossless,
            sampleRate: metadata.format.sampleRate + 'Hz'
        };
    }
}