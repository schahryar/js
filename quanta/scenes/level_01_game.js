class level_01_game extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_01_game' });
		this.lifeCount = 5;
        this.isDead = false;
    }

	

preload() {

    // map_lvl_1 made with Tiled in JSON format
    this.load.tilemapTiledJSON('map_lvl_1', 'assets/tiled_lvl_01.json');
    // tiles in spritesheet
    this.load.spritesheet('tiled_lvl_01', 'assets/tiled_lvl_01.png', {frameWidth: 64, frameHeight: 64});

    this.load.atlas('char_noah', 'assets/char_noah.png', 'assets/char_noah.json');
		

	// bomb preload
	this.load.image('bomb', 'assets/bomb.png');
	this.load.audio('boom', 'assets/boom.mp3');
	this.load.image('life', 'assets/life.png');

    }


 create() {

	// timer for drop bomb function
	this.timedEvent = this.time.addEvent({ delay: 900, callback: this.dropBombs, callbackScope: this, loop: true });

	 
	 this.boomSnd = this.sound.add('boom');
	

        // load the map_lvl_1
        this.map_lvl_1 = this.make.tilemap({key:'map_lvl_1'});
        // tiles for the ground layer
		this.bg_tiles = this.map_lvl_1.addTilesetImage('tiled_lvl_01');
        // create the ground layer
        this.bg_layer = this.map_lvl_1.createDynamicLayer('bg_layer', this.bg_tiles, 0, 0);
        this.space_layer = this.map_lvl_1.createDynamicLayer('space_layer', this.bg_tiles, 0, 0);
//        platformLayer = this.map_lvl_1.createDynamicLayer('platformLayer', groundTiles, 0, 0);

 
    // Set starting and ending position using object names in tiles
    this.startPoint = this.map_lvl_1.findObject("ObjectLayer", obj => obj.name === "startPoint");
    this.endPoint = this.map_lvl_1.findObject("ObjectLayer", obj => obj.name === "endPoint");

    // Make it global variable for troubleshooting
    window.startPoint = this.startPoint;
    window.endPoint = this.endPoint;

    // Place an image manually on the endPoint
    this.add.image(this.endPoint.x, this.endPoint.y, 'end').setOrigin(0, 0);

		 

    // create the player_lvl_1 sprite    
    this.player_lvl_1 = this.physics.add.sprite(70, 150, 'char_noah');
    this.player_lvl_1.setBounce(0.2); // our player_lvl_1 will bounce from items
    this.player_lvl_1.setCollideWorldBounds(true); // don't go out of the map_lvl_1    
   // Adjust the size if necessary
    this.player_lvl_1.body.setSize(this.player_lvl_1.width, this.player_lvl_1.height);

   // Create the still animations, using first frame
    this.anims.create({
        key: 'still',
        frames: [{key: 'char_noah', frame: 'noah_03'}],
        frameRate: 5,
    });

    // Create the walking animation with prefix of boy_
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNames('char_noah', {prefix: 'noah_', start: 2, end: 3, zeroPad: 2}),
        frameRate: 5,
        repeat: -1
    });



// Set Collisions
// the player_lvl_1 will collide with this layer
this.space_layer.setCollisionByExclusion([-1]);

// set the boundaries of our game world
this.physics.world.bounds.width = this.space_layer.width;
this.physics.world.bounds.height = this.space_layer.height;

this.player_lvl_1.setCollideWorldBounds(true); // don't go out of the map_lvl_1

// player_lvl_1 will collide with the level tiles
this.physics.add.collider(this.space_layer, this.player_lvl_1);


    // player_lvl_1 walk animation
    this.anims.create({
    key:'walk',
    frames:this.anims.generateFrameNames('player_lvl_1', {prefix:'p1_walk', start:1, end:11, zeroPad:2}),
    frameRate:10,
    repeat: -1
    });
    // still with only one frame, so repeat is not needed
    
    this.anims.create({
    key:'still',
    frames: [{key:'player_lvl_1', frame:'p1_stand'}],
    frameRate:10,
    });
    
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
    this.cameras.main.setBounds(0, 0, this.map_lvl_1.widthInPixels, this.map_lvl_1.heightInPixels);
    // make the camera follow the player_lvl_1
    this.cameras.main.startFollow(this.player_lvl_1);
    
    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#292860');

		 
	// collide bomb
	this.bombs = this.physics.add.group({defaultKey: 'bomb'});
	// call hit bomb function
	this.physics.add.overlap(this.player_lvl_1, this.bombs, this.hitBombs, null, this );

	this.add.text(10,10, 'Level 1 - Noah', { font: '18px Courier', fill: '#ffffff' }).setScrollFactor(0);
		
	// Add life image at the end 
    this.life1 = this.add.image(50,530, 'life').setScrollFactor(0);
    this.life2 = this.add.image(100,530,'life').setScrollFactor(0);
    this.life3 = this.add.image(150,530,'life').setScrollFactor(0);
    this.life4 = this.add.image(200,530,'life').setScrollFactor(0);
    this.life5 = this.add.image(250,530,'life').setScrollFactor(0);
    }


// Hit Bombs function
hitBombs(player_lvl_1,bombs) {
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
    this.player_lvl_1.body.setVelocityX(-200);
    this.player_lvl_1.anims.play('run', true); // walk left
    this.player_lvl_1.flipX = true; // flip the sprite to the left
    }
    else if (this.cursors.right.isDown)
    {
    console.log("right");
    this.player_lvl_1.body.setVelocityX(200);
    this.player_lvl_1.anims.play('run', true);
    this.player_lvl_1.flipX = false; // use the original sprite looking to the right
    } else {
    console.log("still");
    this.player_lvl_1.body.setVelocityX(0);
	this.player_lvl_1.body.setVelocityY(10);
    this.player_lvl_1.anims.play('still', true);
		
    }
    // up
	if (this.cursors.up.isDown)
    {
    console.log("up");
    this.player_lvl_1.body.setVelocityY(-50);
    }
	 // down
	if (this.cursors.down.isDown)
    {
    console.log("down");
    this.player_lvl_1.body.setVelocityY(50);
    }


	// end point
	let distX = this.endPoint.x - this.player_lvl_1.x;
    let distY = this.endPoint.y - this.player_lvl_1.y;
    // Check for reaching endPoint object
    if ( this.player_lvl_1.x >= this.endPoint.x && this.player_lvl_1.y <= this.endPoint.y ) {
        console.log('Reached endPoint, loading next level');
        this.scene.stop("level_01_game");
        this.scene.start("level_01_cutscene_01");
    }

    }

// Drop Bombs fuction
 dropBombs() {
	// Add random bombs
    console.log('Dropping bombs');
    this.bombs.createMultiple({
    key: 'bomb',
    repeat: 1,
	setVelocityX:200,
	setAllowGravity:true,
    setXY: { x: Phaser.Math.Between(this.player_lvl_1.x-20, this.player_lvl_1.x-780), y: Phaser.Math.Between(this.player_lvl_1.y-400, this.player_lvl_1.y-700), stepX: Phaser.Math.Between(0, 1000) }
    });
    this.cameras.main.shake(1);
}

    }