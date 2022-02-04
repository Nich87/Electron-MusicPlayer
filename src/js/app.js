let player;
let list = [];

ipcRenderer.on('start', () => Maker());

function Maker() {
    player = new Howl({
        src: list[0],
        loop: false
    });
    player.on('load', () => player.play());
    player.on('end', () => {
        console.debug('end');
        player.unload();
        list.shift();
        //if(list.length > 0) return;
        Maker();
    });
}