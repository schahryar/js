class level_03_cutscene_03 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_03_cutscene_03' });
    }

    preload() {
        this.load.image('level_03_cutscene_03','assets/level_03_cutscene_03.jpg');

    }

    create () {

        this.add.image(0, 0, 'level_03_cutscene_03').setOrigin(0, 0);
        
//        this.add.text(0,580, 'Press Spacebar to continue', { font: '24px Courier', fill: '#000000' });

        console.log("This is LEVEL 3 Cutscene 03");

        //this.input.once('pointerdown', function(){
        var spaceDown = this.input.keyboard.addKey('SPACE');
        
        spaceDown.on('down', function(){
        console.log("Spacebar pressed, goto level_03_cutscene_03");
        this.scene.stop("level_03_cutscene_03");
        this.scene.start("intro_01");
        }, this );

    }

}