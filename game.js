function preload() {
  this.load.image('bug1', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_1.png');
  this.load.image('bug2', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_2.png');
  this.load.image('bug3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_3.png');
  this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
  this.load.image('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/codey.png');
}

var localStorageName = "crackalien";
var highscore = localStorage.getItem(localStorageName) == null ? 0 : localStorage.getItem(localStorageName);

const gameState = {
  score: 0,
  highscore: highscore
};


function create() {
  gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);
  
  const platforms = this.physics.add.staticGroup();

  platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();

  gameState.scoreText = this.add.text(95, 485, 'Bugs Avoided: 0', { fontSize: '15px', fill: '#000000' });
  
  gameState.highscoreText = this.add.text(295, 485, 'High Score: 0', { fontSize: '15px', fill: '#000000' });
  gameState.highscoreText.setText(`High Score: ${gameState.highscore}`);

  gameState.player.setCollideWorldBounds(true);

  this.physics.add.collider(gameState.player, platforms);
  
	gameState.cursors = this.input.keyboard.createCursorKeys();

  const bugs = this.physics.add.group();

  function bugGen () {
    const xCoord = Math.random() * 450;
    bugs.create(xCoord, 10, 'bug1');
  }

  const bugGenLoop = this.time.addEvent({
    delay: 160,
    callback: bugGen,
    callbackScope: this,
    loop: true,
  });

  this.physics.add.collider(bugs, platforms, function (bug) {
    bug.destroy();
    gameState.score += 1;
    gameState.scoreText.setText(`Bugs Avoided: ${gameState.score}`);
  })
  
  this.physics.add.collider(gameState.player, bugs, () => {
    bugGenLoop.destroy();
    this.physics.pause();
    this.add.text(180, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
    this.add.text(152, 270, 'Click to Restart', { fontSize: '15px', fill: '#000000' });
    
    if (gameState.score > gameState.highscore){
      gameState.highscore = gameState.score ;
      localStorage.setItem(localStorageName, gameState.highscore);
    }
    else{ null }
    gameState.highscoreText.setText(`High Score: ${gameState.highscore}`);
    this.input.on('pointerup', () =>{
    	this.scene.restart();
      gameState.score = 0;
    });
  });
}

function update() {
  if (gameState.cursors.left.isDown) {
    gameState.player.setVelocityX(-160);
  } else if (gameState.cursors.right.isDown) {
    gameState.player.setVelocityX(160);
  } else {
    //(gameState.player.setVelocityX(0))
  }
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);
