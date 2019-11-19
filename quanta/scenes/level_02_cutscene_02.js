class level_02_cutscene_02 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_02_cutscene_02' });
    }

    preload() {
        this.load.image('level_02_cutscene_02','assets/level_02_cutscene_02.jpg');

    }

    create () {

        this.add.image(0, 0, 'level_02_cutscene_02').setOrigin(0, 0);
        
//        this.add.text(0,580, 'Press Spacebar to continue', { font: '24px Courier', fill: '#000000' });

        console.log("This is LEVEL 2 Cutscene 02");

        //this.input.once('pointerdown', function(){
        var spaceDown = this.input.keyboard.addKey('SPACE');
        
        spaceDown.on('down', function(){
        console.log("Spacebar pressed, goto level_02_cutscene_02");
        this.scene.stop("level_02_cutscene_02");
        this.scene.start("level_02_cutscene_03");
        }, this );


    }

}
