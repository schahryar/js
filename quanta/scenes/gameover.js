class gameover extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'gameover' });
    }

    preload() {
        this.load.image('gameover','assets/gameover.jpg');

    }

    create () {

        this.add.image(0, 0, 'gameover').setOrigin(0, 0);
        
//        this.add.text(0,580, 'Press Spacebar to continue', { font: '24px Courier', fill: '#000000' });

        console.log("This is Gameover");

        //this.input.once('pointerdown', function(){
        var spaceDown = this.input.keyboard.addKey('SPACE');
        
        spaceDown.on('down', function(){
        console.log("Spacebar pressed, goto level_01_game");
        this.scene.stop("gameover");
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
