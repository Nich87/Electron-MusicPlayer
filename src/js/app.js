let player;
M.AutoInit();

ipcRenderer.on('start', (args,filelist) => {
    filelist = Object.values(filelist);
    console.log(filelist)
    Maker(filelist);
});

function Maker(list) {
    player = new Howl({
        src: list[0],
        loop: true
    });
    player.on('load', () => player.play());
    player.on('end', () => {
        console.debug('end');
        player.unload();
        list.shift();
        Maker(list);
    });
    player.on('play', () => play());
}

const play = () => {

}
