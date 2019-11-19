class level_03_game extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'level_03_game' });
		this.lifeCount = 3;
        this.isDead = false;
    }
	
    
     
    
preload() {

    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'assets/tiled_lvl_03.json');
    // tiles in spritesheet
//    this.load.spritesheet('tiles64x64', 'assets/tiles64x64.png', {frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('tiled_lvl_03', 'assets/tiled_lvl_03.png', {frameWidth: 64, frameHeight: 64});

//    this.load.atlas('player', 'assets/player.png', 'assets/player.json');

    // this.load.atlas to load the texture packer image and json
    this.load.atlas('char_alienship', 'assets/char_alienship.png', 'assets/char_alienship.json');
		

	// bomb preload
	this.load.image('bomb', 'assets/bomb.png');

    }



    
    create() {
    
        // load the map
        this.map = this.make.tilemap({key:'map'});
        // tiles for the ground layer
//        var groundTiles = map.addTilesetImage('tiles64x64');
//        var groundTiles = map.addTilesetImage('tiles64x64');
		var bg_tiles = this.map.addTilesetImage('tiled_lvl_03');
        // create the ground layer
        this.bg_layer = this.map.createDynamicLayer('bg_layer', this.bg_tiles, 0, 0);
        this.space_layer = this.map.createDynamicLayer('space_layer', this.bg_tiles, 0, 0);
//        platformLayer = this.map.createDynamicLayer('platformLayer', groundTiles, 0, 0);
    

	// Add animation for mummy
this.anims.create({
   key:'walk',
   frames:this.anims.generateFrameNumbers('mummy'),
   frameRate:20,
   yoyo:true,
   repeat:-1
});
		
		
		
	// Add random bomb
	this.bombs=this.physics.add.group({
	key:'bomb',
	repeat:20,
	gravity: {x: 100, y: 200},
	setXY: { x:100, y:0, stepX:Phaser.Math.Between(100, 500)}
	});
	window.bombs = this.bombs;




    // create the player sprite    
    this.player = this.physics.add.sprite(70, 150, 'char_alienship');
    this.player.setBounce(0.2); // our player will bounce from items
    this.player.setCollideWorldBounds(true); // don't go out of the map    
   // Adjust the size if necessary
    this.player.body.setSize(this.player.width, this.player.height);

   // Create the idle animations, using first frame
    this.anims.create({
        key: 'idle',
        frames: [{key: 'char_alienship', frame: 'alienship_02'}],
        frameRate: 5,
    });
    this.anims.create({
        key: 'forward',
        frames: [{key: 'char_alienship', frame: 'alienship_03'}],
        frameRate: 5,
    });
    this.anims.create({
        key: 'reverse',
        frames: [{key: 'char_alienship', frame: 'alienship_04'}],
        frameRate: 5,
    });

    // Create the walking animation with prefix of boy_
    this.anims.create({
        key: 'boywalk',
        frames: this.anims.generateFrameNames('char_alienship', {prefix: 'alienship_', start: 2, end: 3, zeroPad: 2}),
        frameRate: 5,
        repeat: -1
    });



            // Set Collisions
// the player will collide with this layer
this.space_layer.setCollisionByExclusion([-1]);

// set the boundaries of our game world
this.physics.world.bounds.width = this.space_layer.width;
this.physics.world.bounds.height = this.space_layer.height;

this.player.setCollideWorldBounds(true); // don't go out of the map

// player will collide with the level tiles
this.physics.add.collider(this.space_layer, this.player);
//this.physics.add.collider(platformLayer, player);

//	this.physics.add.overlap(player, space_layer, game_over, null, this);

		

        // player walk animation
    this.anims.create({
    key:'walk',
    frames:this.anims.generateFrameNames('player', {prefix:'p1_walk', start:1, end:11, zeroPad:2}),
    frameRate:10,
    repeat: -1
    });
    // idle with only one frame, so repeat is not needed
    
    this.anims.create({
    key:'idle',
    frames: [{key:'player', frame:'p1_stand'}],
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
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(this.player);
    
    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#292860');

    }


    update(time, delta) {
    
    if (this.cursors.left.isDown)
    {
    console.log("left");
    this.player.body.setVelocityX(-200);
    this.player.anims.play('reverse', true); // walk left
    }
    else if (this.cursors.right.isDown)
    {
    console.log("right");
    this.player.body.setVelocityX(200);
    this.player.anims.play('forward', true);
    this.player.flipX = false; // use the original sprite looking to the right
    } else {
    console.log("idle");
    this.player.body.setVelocityX(0);
	this.player.body.setVelocityY(10);
    this.player.anims.play('idle', true);
//	this.player.body.setGravityY(5);
//	this.player.body.setAllowGravity(true);
		
    }
    // up
	if (this.cursors.up.isDown)
    {
    console.log("up");
    this.player.body.setVelocityY(-50);
    }
	 // down
	if (this.cursors.down.isDown)
    {
    console.log("down");
    this.player.body.setVelocityY(50);
    }
//    if (cursors.up.isDown && player.body.onFloor())
//    {
//    console.log("jump");
//    player.body.setVelocityY(-500);
//    }





    }

}

