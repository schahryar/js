class level_03_game extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_03_game' });
		this.lifeCount = 5;
        this.isDead = false;
    }

	

preload() {

    // map_lvl_3 made with Tiled in JSON format
    this.load.tilemapTiledJSON('map_lvl_3', 'assets/tiled_lvl_03.json');
    // tiles in spritesheet
    this.load.spritesheet('tiled_lvl_03', 'assets/tiled_lvl_03.png', {frameWidth: 64, frameHeight: 64});

    this.load.atlas('char_alienship', 'assets/char_alienship.png', 'assets/char_alienship.json');
		

	// graphic assets
	this.load.image('bomb', 'assets/bomb.png');
	this.load.image('life', 'assets/life.png');
	this.load.image('level_03_end', 'assets/level_03_end.png');

	// sfx
	this.load.audio('boom', 'assets/boom.mp3');
	this.load.audio('music_level_1', 'assets/music_level_1.mp3');
	this.load.audio('music_level_2', 'assets/music_level_2.mp3');
	this.load.audio('music_level_3', 'assets/music_level_3.mp3');
    }



 create() {

	// timer for drop bomb function
	this.timedEvent = this.time.addEvent({ delay: 900, callback: this.dropBombs, callbackScope: this, loop: true });
		 
 
		// audio sound
		this.musicSnd_3 = this.sound.add('music_level_3');
		this.boomSnd = this.sound.add('boom');

		// play background sound
 	 	this.musicSnd_3.play().loop;
 	 	this.musicSnd_3.loop = true;
	

        // load the map_lvl_3
        this.map_lvl_3 = this.make.tilemap({key:'map_lvl_3'});
        // tiles for the ground layer
		this.bg_tiles = this.map_lvl_3.addTilesetImage('tiled_lvl_03');
        // create the ground layer
        this.bg_layer = this.map_lvl_3.createDynamicLayer('bg_layer', this.bg_tiles, 0, 0);
        this.space_layer = this.map_lvl_3.createDynamicLayer('space_layer', this.bg_tiles, 0, 0);
//        platformLayer = this.map_lvl_3.createDynamicLayer('platformLayer', groundTiles, 0, 0);

 
    // Set starting and ending position using object names in tiles
    this.startPoint = this.map_lvl_3.findObject("ObjectLayer", obj => obj.name === "startPoint");
    this.endPoint = this.map_lvl_3.findObject("ObjectLayer", obj => obj.name === "endPoint");

    // Make it global variable for troubleshooting
    window.startPoint = this.startPoint;
    window.endPoint = this.endPoint;

    // Place an image manually on the endPoint
    this.add.image(this.endPoint.x, this.endPoint.y, 'level_03_end').setOrigin(0, 0);

		 

    // create the player_lvl_3 sprite    
    this.player_lvl_3 = this.physics.add.sprite(70, 150, 'char_alienship');
    this.player_lvl_3.setBounce(0.2); // our player_lvl_3 will bounce from items
    this.player_lvl_3.setCollideWorldBounds(true); // don't go out of the map_lvl_3    
   // Adjust the size if necessary
    this.player_lvl_3.body.setSize(this.player_lvl_3.width, this.player_lvl_3.height);

   // Create the idle animations, using first frame
    this.anims.create({
        key: 'idle',
        frames: [{key: 'char_alienship', frame: 'alienship_02'}],
        frameRate: 5,
    });
    this.anims.create({
        key: 'move_right',
        frames: [{key: 'char_alienship', frame: 'alienship_03'}],
        frameRate: 5,
    });
    this.anims.create({
        key: 'move_left',
        frames: [{key: 'char_alienship', frame: 'alienship_04'}],
        frameRate: 5,
    });

    // Create the walking animation with prefix of boy_
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNames('char_alienship', {prefix: 'alienship_', start: 2, end: 3, zeroPad: 2}),
        frameRate: 5,
        repeat: -1
    });



            // Set Collisions
// the player_lvl_3 will collide with this layer
this.space_layer.setCollisionByExclusion([-1]);

// set the boundaries of our game world
this.physics.world.bounds.width = this.space_layer.width;
this.physics.world.bounds.height = this.space_layer.height;

this.player_lvl_3.setCollideWorldBounds(true); // don't go out of the map_lvl_3

// player_lvl_3 will collide with the level tiles
this.physics.add.collider(this.space_layer, this.player_lvl_3);


    // player_lvl_3 walk animation
    this.anims.create({
    key:'walk',
    frames:this.anims.generateFrameNames('player_lvl_3', {prefix:'p1_walk', start:1, end:11, zeroPad:2}),
    frameRate:10,
    repeat: -1
    });
    // idle with only one frame, so repeat is not needed
    
    this.anims.create({
    key:'idle',
    frames: [{key:'player_lvl_3', frame:'p1_stand'}],
    frameRate:10,
    });
    
    // Create the cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();



    // this text will show the score
this.text = this.add.text(20, 570, '', {
    fontSize:'20px',
    fill:'#ffffff'
    });
        // fix the text to the camera
this.text.setScrollFactor(0);
		 

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, this.map_lvl_3.widthInPixels, this.map_lvl_3.heightInPixels);
    // make the camera follow the player_lvl_3
    this.cameras.main.startFollow(this.player_lvl_3);
    
    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#292860');
		 
		 
		 
	// collide bomb
	this.bombs = this.physics.add.group({defaultKey: 'bomb'});
	// call hit bomb function
	this.physics.add.overlap(this.player_lvl_3, this.bombs, this.hitBombs, null, this );

	this.add.text(10,10, 'Level 3 - Alienship', { font: '18px Courier', fill: '#ffffff' }).setScrollFactor(0);
		
	// Add life image at the end 
    this.life1 = this.add.image(50,530, 'life').setScrollFactor(0);
    this.life2 = this.add.image(100,530,'life').setScrollFactor(0);
    this.life3 = this.add.image(150,530,'life').setScrollFactor(0);
    this.life4 = this.add.image(200,530,'life').setScrollFactor(0);
    this.life5 = this.add.image(250,530,'life').setScrollFactor(0);
    }

	
	
// Hit Bombs function
hitBombs(player_lvl_3,bombs) {
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
    console.log("player_lvl_3 is dead!!!")
	this.scene.stop("level_03_game");
 
    // Reset counter before a restart
    this.isDead = false;
    this.lifeCount = 5;
	this.musicSnd_3.stop();
    this.scene.start("gameover");
    }
}


    update(time, delta) {
    
    if (this.cursors.left.isDown)
    {
    console.log("left");
    this.player_lvl_3.body.setVelocityX(-200);
    this.player_lvl_3.anims.play('move_left', true); // walk left
    }
    else if (this.cursors.right.isDown)
    {
    console.log("right");
    this.player_lvl_3.body.setVelocityX(200);
    this.player_lvl_3.anims.play('move_right', true);
    this.player_lvl_3.flipX = false; // use the original sprite looking to the right
    } else {
    console.log("idle");
    this.player_lvl_3.body.setVelocityX(0);
	this.player_lvl_3.body.setVelocityY(10);
    this.player_lvl_3.anims.play('idle', true);
		
    }
    // up
	if (this.cursors.up.isDown)
    {
    console.log("up");
    this.player_lvl_3.body.setVelocityY(-50);
    }
	 // down
	if (this.cursors.down.isDown)
    {
    console.log("down");
    this.player_lvl_3.body.setVelocityY(50);
    }


	// end point
	let distX = this.endPoint.x - this.player_lvl_3.x;
    let distY = this.endPoint.y - this.player_lvl_3.y;
    // Check for reaching endPoint object
    if ( this.player_lvl_3.x >= this.endPoint.x+180) {
        console.log('Reached endPoint, loading next level');
		this.musicSnd_3.stop();
        this.scene.stop("level_03_game");
        this.scene.start("level_03_cutscene_01");
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
    setXY: { x: Phaser.Math.Between(this.player_lvl_3.x-20, this.player_lvl_3.x-780), y: Phaser.Math.Between(this.player_lvl_3.y-400, this.player_lvl_3.y-700), stepX: Phaser.Math.Between(0, 1000) }
    });
    this.cameras.main.shake(1);
}


    }