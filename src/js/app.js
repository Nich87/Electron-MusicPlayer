let player;

ipcRenderer.on('start', (args,filelist) => {
    filelist = Object.values(filelist);
    console.log(filelist)
    Maker(filelist);
});

function Maker(list) {
    player = new Howl({
        src: list[0],
        loop: false
    });
    player.on('load', () => player.play());
    player.on('end', () => {
        console.debug('end');
        player.unload();
        list.shift();
        Maker(list);
    });
}