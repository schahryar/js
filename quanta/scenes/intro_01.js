class intro_01 extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'intro_01' });
    }

    preload() {
	// gfx
    this.load.image('intro_01','assets/intro_01.jpg');
    this.load.image('intro_02','assets/intro_01.jpg');
    this.load.image('intro_03','assets/intro_01.jpg');

	// sfx
	this.load.audio('boom', 'assets/boom.mp3');
	this.load.audio('music_level_1', 'assets/music_level_1.mp3');
	this.load.audio('music_level_2', 'assets/music_level_2.mp3');
	this.load.audio('music_level_3', 'assets/music_level_3.mp3');

    }

    create () {

        this.add.image(0, 0, 'intro_01').setOrigin(0, 0);
        
//        this.add.text(0,580, 'Press Spacebar to continue', { font: '24px Courier', fill: '#000000' });

        console.log("This is INTRO 1");

        //this.input.once('pointerdown', function(){
        var spaceDown = this.input.keyboard.addKey('SPACE');
        
        spaceDown.on('down', function(){
        console.log("Spacebar pressed, goto intro_02");
        this.scene.stop("intro_01");
        this.scene.start("intro_02");
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
