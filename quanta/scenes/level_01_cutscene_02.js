class level_01_cutscene_02 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_01_cutscene_02' });
    }

    preload() {
        this.load.image('level_01_cutscene_02','assets/level_01_cutscene_02.jpg');

    }

    create () {
		
	 this.musicSnd_1 = this.sound.add('music_level_1');
 	 this.musicSnd_1.stop();


        this.add.image(0, 0, 'level_01_cutscene_02').setOrigin(0, 0);

        console.log("This is LEVEL 1 Cutscene 02");

        //this.input.once('pointerdown', function(){
        var spaceDown = this.input.keyboard.addKey('SPACE');
        
        spaceDown.on('down', function(){
        console.log("Spacebar pressed, goto level_01_cutscene_02");
        this.scene.stop("level_01_cutscene_02");
        this.scene.start("level_02_game");
        }, this );

    }

}