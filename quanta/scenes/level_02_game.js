
class level_02_game extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_02_game' });
		this.lifeCount = 5;
        this.isDead = false;
    }




     preload() {

    // map_lvl_2 made with Tiled in JSON format
    this.load.tilemapTiledJSON('map_lvl_2', 'assets/tiled_lvl_02.json');
    // tiles in spritesheet
    this.load.spritesheet('tiled_lvl_02', 'assets/tiled_lvl_02.png', {frameWidth: 64, frameHeight: 64});
    this.load.atlas('char_quantaship', 'assets/char_quantaship.png', 'assets/char_quantaship.json');


	// bomb preload
	this.load.image('bomb', 'assets/bomb.png');

	// preload audio
	this.load.audio('engine', 'assets/quantaship_engine.mp3');
	this.load.audio('boom', 'assets/boom.mp3');
	this.load.audio('ost', 'assets/ost_space.mp3');

	this.load.image('end', 'assets/end.png');
	this.load.image('life', 'assets/life.png');
    }





    create() {
		
	// timer for drop bomb function
	this.timedEvent = this.time.addEvent({ delay: 900, callback: this.dropBombs, callbackScope: this, loop: true });
		

		// audio sound
		this.boosterSnd = this.sound.add('engine');
		this.explodeSnd = this.sound.add('engine');
		this.ostSnd = this.sound.add('ost');
		this.boomSnd = this.sound.add('boom');

		// play background sound
		this.ostSnd.play();

        // load the map_lvl_2
        this.map_lvl_2 = this.make.tilemap({key:'map_lvl_2'});
		this.bg_tiles = this.map_lvl_2.addTilesetImage('tiled_lvl_02');
        // create the ground layer
        this.bg_layer = this.map_lvl_2.createDynamicLayer('bg_layer', this.bg_tiles, 0, 0);
        this.space_layer = this.map_lvl_2.createDynamicLayer('space_layer', this.bg_tiles, 0, 0);
//        platformLayer = this.map_lvl_2.createDynamicLayer('platformLayer', groundTiles, 0, 0);
    
	
		
    // Set starting and ending position using object names in tiles
    this.startPoint = this.map_lvl_2.findObject("ObjectLayer", obj => obj.name === "startPoint");
    this.endPoint = this.map_lvl_2.findObject("ObjectLayer", obj => obj.name === "endPoint");

    // Make it global variable for troubleshooting
    window.startPoint = this.startPoint;
    window.endPoint = this.endPoint;

    // Place an image manually on the endPoint
    this.add.image(this.endPoint.x, this.endPoint.y, 'end').setOrigin(0, 0);

    this.player_lvl_2 = this.physics.add.sprite(95, 168, 'char_quantaship');
		
		this.player_lvl_2.setPosition(400,6136);
    this.player_lvl_2.setBounce(0.2); // our player_lvl_2 will bounce from items
    this.player_lvl_2.setCollideWorldBounds(true); // don't go out of the map_lvl_2  
		this.player_lvl_2.body.setAllowGravity(false);
//		this.player_lvl_2.body.setGravityY(0.8);
   // Adjust the size if necessary
    this.player_lvl_2.body.setSize(this.player_lvl_2.width, this.player_lvl_2.height);
		window.player_lvl_2 = this.player_lvl_2;
   // Create the no_move animations, using first frame
    this.anims.create({
        key: 'no_move',
        frames: [{key: 'char_quantaship', frame: 'quantaship_02'}],
        frameRate: 5,
    });
    this.anims.create({
        key: 'reverse',
        frames: [{key: 'char_quantaship', frame: 'quantaship_04'}],
        frameRate: 5,
    });

    // Create the walking animation with prefix of boy_
    this.anims.create({
        key: 'move',
        frames: this.anims.generateFrameNames('char_quantaship', {prefix: 'quantaship_', start: 2, end: 3, zeroPad: 2}),
        frameRate: 5,
        repeat: -1
    });



// Set Collisions
// the player_lvl_2 will collide with this layer
this.space_layer.setCollisionByExclusion([-1]);

// set the boundaries of our game world
this.physics.world.bounds.width = this.space_layer.width;
this.physics.world.bounds.height = this.space_layer.height;

this.player_lvl_2.setCollideWorldBounds(true); // don't go out of the map_lvl_2

// player_lvl_2 will collide with the level tiles
this.physics.add.collider(this.space_layer, this.player_lvl_2);
//this.physics.add.collider(platformLayer, player_lvl_2);


	// collide bomb
	this.bombs = this.physics.add.group({defaultKey: 'bomb'});
	// call hit bomb function
	this.physics.add.overlap(this.player_lvl_2, this.bombs, this.hitBombs, null, this );
  
    // Create the cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();



    // this text will show the score
this.text = this.add.text(20, 570, '0', {
    fontSize:'20px',
    fill:'#ffffff'
    });
        // fix the text to the camera
this.text.setScrollFactor(0);



    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, this.map_lvl_2.widthInPixels, this.map_lvl_2.heightInPixels);
    // make the camera follow the player_lvl_2
    this.cameras.main.startFollow(this.player_lvl_2);
    
    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#292860');
		
		
		
	this.add.text(10,10, 'Level 2 - Quantaship', { font: '18px Courier', fill: '#ffffff' }).setScrollFactor(0);
		
	// Add life image at the end 
    this.life1 = this.add.image(50,530, 'life').setScrollFactor(0);
    this.life2 = this.add.image(100,530,'life').setScrollFactor(0);
    this.life3 = this.add.image(150,530,'life').setScrollFactor(0);
    this.life4 = this.add.image(200,530,'life').setScrollFactor(0);
    this.life5 = this.add.image(250,530,'life').setScrollFactor(0);
    }

	
// Hit Bombs function
hitBombs(player_lvl_2,bombs) {
    bombs.disableBody(true, true);
	this.lifeCount -= 1;
    console.log('Hit bomb, restart game',this.lifeCount);


	    // Default is 5 lives
    if ( this.lifeCount === 4) {
        this.boomSnd.play();
        this.cameras.main.shake(100);
        this.life5.setVisible(false);
    } else if ( this.lifeCount === 3) {
        this.boomSnd.play();
        this.cameras.main.shake(100);
        this.life4.setVisible(false);
    } else if ( this.lifeCount === 2) {
        this.boomSnd.play();
        this.cameras.main.shake(500);
        this.life3.setVisible(false);
    } else if ( this.lifeCount === 1) {
        this.boomSnd.play();
        this.cameras.main.shake(500);
        this.life2.setVisible(false);
	}  else if ( this.lifeCount === 0) {
        this.boomSnd.play();
        this.cameras.main.shake(500);
        this.life1.setVisible(false);
        this.isDead = true;
	}

    this.cameras.main.shake(300);

	// No more lives, shake screen and restart the game
    if ( this.isDead ) {
    console.log("player_lvl_1 is dead!!!")
	this.scene.stop("level_01_game");
    this.scene.start("gameover");
    // delay 1 sec
    this.time.delayedCall(2000,function() {
        // Reset counter before a restart
        this.isDead = false;
        this.lifeCount = 5;
        this.scene.restart();
    },[], this);
    }
}




    update(time, delta) {
    
    if (this.cursors.left.isDown)
    {
    console.log("left");
    this.player_lvl_2.body.setVelocityX(-200);
    this.player_lvl_2.anims.play('move', true); // walk left
    this.player_lvl_2.flipX = true; // flip the sprite to the left
    }
    else if (this.cursors.right.isDown)
    {
    console.log("right");
    this.player_lvl_2.body.setVelocityX(200);
    this.player_lvl_2.anims.play('move', true);
    this.player_lvl_2.flipX = false; // use the original sprite looking to the right
    } else if (this.cursors.up.isDown)
    {
    console.log("up");
    this.player_lvl_2.anims.play('move', true);
    this.player_lvl_2.flipX = false; // use the original sprite looking to the right
//		this.boosterSnd.play();
		
    } else if (this.cursors.down.isDown)
    {
    console.log("down");
    this.player_lvl_2.anims.play('reverse', true);
    this.player_lvl_2.flipX = false; // use the original sprite looking to the right
    }else {
    console.log("no_move");
    this.player_lvl_2.body.setVelocityX(0);
	this.player_lvl_2.body.setVelocityY(5);
    this.player_lvl_2.anims.play('no_move', true);

    }
    // up
	if (this.cursors.up.isDown)
    {
    console.log("up");
    this.player_lvl_2.body.setVelocityY(-200);
	this.player_lvl_2.body.setVelocityX(0);
    }
	if (this.cursors.up.isDown && this.cursors.left.isDown) {
			   this.player_lvl_2.body.setVelocityY(-100);
			   this.player_lvl_2.body.setVelocityX(-200);
		}
	if (this.cursors.up.isDown && this.cursors.right.isDown) {
			   this.player_lvl_2.body.setVelocityY(-100);
			   this.player_lvl_2.body.setVelocityX(200);
		}
	 // down
	if (this.cursors.down.isDown)
    {
    console.log("down");
    this.player_lvl_2.body.setVelocityY(70);
	this.player_lvl_2.body.setVelocityX(0);
		
		
			if (this.cursors.down.isDown && this.cursors.left.isDown) {
			   this.player_lvl_2.body.setVelocityY(80);
			   this.player_lvl_2.body.setVelocityX(-200);
		}
	if (this.cursors.down.isDown && this.cursors.right.isDown) {
			   this.player_lvl_2.body.setVelocityY(80);
			   this.player_lvl_2.body.setVelocityX(200);
		}
		
		
 }


	// end point	
    let distX = this.endPoint.x - this.player_lvl_2.x;
    let distY = this.endPoint.y - this.player_lvl_2.y;
    // Check for reaching endPoint object
    if ( this.player_lvl_2.x >= this.endPoint.x && this.player_lvl_2.y <= this.endPoint.y ) {
        console.log('Reached endPoint, loading next level');
        this.scene.stop("level_02_game");
        this.scene.start("level_02_cutscene_01");
    }

    }


// Drop Bombs fuction
 dropBombs() {
	// Add random bombs
    console.log('Dropping bombs');
    this.bombs.createMultiple({
    key: 'bomb',
    repeat: 1,
	setVelocityX:100,
	setAllowGravity:true,
    setXY: { x: Phaser.Math.Between(20, 780), y: Phaser.Math.Between(this.player_lvl_2.y-400, this.player_lvl_2.y-700), stepX: Phaser.Math.Between(0, 1000) }
    });
    this.cameras.main.shake(1);
}


}
