class intro_03 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'intro_03' });
    }

    preload() {
        this.load.image('intro_03','assets/intro_03.jpg');

    }

    create () {

        this.add.image(0, 0, 'intro_03').setOrigin(0, 0);
        
//        this.add.text(0,580, 'Press Spacebar to continue', { font: '24px Courier', fill: '#000000' });

        console.log("This is INTRO 3");

        //this.input.once('pointerdown', function(){
        var spaceDown = this.input.keyboard.addKey('SPACE');
        
        spaceDown.on('down', function(){
        console.log("Spacebar pressed, goto level_01_game");
        this.scene.stop("intro_03");
        this.scene.start("level_01_game");
        }, this );
		
		
		
		
		var key1 = this.input.keyboard.addKey(49);
		var key2 = this.input.keyboard.addKey(50);
		var key3 = this.input.keyboard.addKey(51);
		
		key1.on('down', function(){
		this.scene.start("level_01_game");	
		}, this );
	

		key2.on('down', function(){
		this.scene.start("level_02_game");	
		}, this );

		key3.on('down', function(){
		this.scene.start("level_03_game");	
		}, this );

    }

}
