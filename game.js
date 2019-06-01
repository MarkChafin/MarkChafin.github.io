let game;

var localStorageName = "crackalien";
var highscore = localStorage.getItem(localStorageName) == null ? 0 : localStorage.getItem(localStorageName);
 
// global game options
let gameOptions = {
    platformStartSpeed: 350,
    spawnRange: [100, 350],
    platformSizeRange: [50, 250],
    playerGravity: 900,
    jumpForce: 400,
    playerStartPosition: 200,
    jumps: 3,
    score: 0,
    lastRun:0,
    highscore: highscore
}
 
window.onload = function() {
 
    // object containing configuration options
    let gameConfig = {
        type: Phaser.canvas,
        width: 1334,
        height: 750,
        scene: playGame,
        backgroundColor: 0x444444,
 
        // physics settings
        physics: {
            default: "arcade"
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}
 
// playGame scene
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.image("platform", "platform.png");
 
        // player is a sprite sheet made by 24x48 pixels
        this.load.spritesheet("player", "kenney_platformercharacters/PNG/Soldier/soldier_tilesheet.png", {
            frameWidth: 70,
            frameHeight: 100
        });
    }
    create(){
 
        // group with all active platforms.
        this.platformGroup = this.add.group({
 
            // once a platform is removed, it's added to the pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });
 
        // pool
        this.platformPool = this.add.group({
 
            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });
 
        // number of consecutive jumps made by the player
        this.playerJumps = 0;
 
        // adding a platform to the game, the arguments are platform width and x position
        this.addPlatform(game.config.width, game.config.width / 2);
 
        // adding the player;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player");
        this.player.setGravityY(gameOptions.playerGravity);
 
        // setting collisions between the player and the platform group
        this.physics.add.collider(this.player, this.platformGroup);
 
        // checking for input
        this.input.on("pointerdown", this.jump, this);
        gameOptions.score = 0;

        gameOptions.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '25px', fill: '#FFFFFF' });
        gameOptions.highscoreText = this.add.text(295, 10, 'High Score: 0', { fontSize: '25px', fill: '#FFFFFF' });
        gameOptions.lastRunText = this.add.text(1100, 10, `Last Run: ${gameOptions.lastRun}`, { fontSize: '25px', fill: '#FFFFFF' });

        const bugGenLoop = this.time.addEvent({
            delay: 100,
            callback: addScore,
            callbackScope: this,
            loop: true,
          });
    }
 
    // the core of the script: platform are added from the pool or created on the fly
    addPlatform(platformWidth, posX){
        let platform;
        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
        }
        else{
            platform = this.physics.add.sprite(posX, game.config.height * 0.8, "platform");
            platform.setImmovable(true);
            platform.setVelocityX(gameOptions.platformStartSpeed * -1);
            this.platformGroup.add(platform);
        }
        platform.displayWidth = platformWidth;
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }
 
    // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
    jump(){
        if(this.player.body.touching.down || (this.playerJumps > 0 & this.playerJumps < gameOptions.jumps)){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
        }
    }
    update(){
 
        // game over
        if(this.player.y > game.config.height){
            this.scene.start("PlayGame");
            gameOptions.lastRun = gameOptions.score;
        }

        if (gameOptions.score > gameOptions.highscore){
          gameOptions.highscore = gameOptions.score ;
          localStorage.setItem(localStorageName, gameOptions.highscore);
        }
        else{ null }
        gameOptions.highscoreText.setText(`High Score: ${gameOptions.highscore}`);
        gameOptions.lastRunText.setText(`Last Run: ${gameOptions.lastRun}`);
        this.player.x = gameOptions.playerStartPosition;
 
        // recycling platforms
        let minDistance = game.config.width;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            minDistance = Math.min(minDistance, platformDistance);
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);
 
        // adding new platforms
        if(minDistance > this.nextPlatformDistance){
            var nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2);
        }
    }
};
function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

function addScore(){
        gameOptions.score += 1;
        gameOptions.scoreText.setText(`Score: ${gameOptions.score}`);
    };