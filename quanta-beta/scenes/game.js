let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200},
            debug: true
        }
    },
    scene: [intro_01, intro_02, level_01_game, level_01_cutscene_01, level_01_cutscene_02, level_02_game, level_02_cutscene_01, level_02_cutscene_02, level_02_cutscene_03, level_03_game, level_03_cutscene_01, level_03_cutscene_02, level_03_cutscene_03, gameover]

};

let game = new Phaser.Game(config);

        console.log("This is GAME.JS");