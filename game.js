var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);

var worldWidth = 9600;
var player;
var platforms;
var cursors;
var Score = 0;
var ScoreText;
var star;
var TimerText;
var timer;
var timeElapsed = 0;
var gameover = false;

function preload() {
    // Load assets
    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('gg', 'assets/plane.png', { frameWidth: 90, frameHeight: 90 });
}

function create ()
{
    //#region Background
    this.background = this.add.tileSprite(0, 0, worldWidth, game.config.height, "background").setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();

    for (var x = 0; x <= worldWidth; x = x + 268) {
        platforms.create(x, 700 - 100, 'platform').setOrigin(0, 0).refreshBody();
    }
    //#endregion

    //#region Player
    player = this.physics.add.sprite(100, 450, 'gg');

    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    //#endregion

    //#region Timer
    TimerText = this.add.text(16, 60, 'Time: 0', { fontSize: '50px', fill: '#000' }).setScrollFactor(0);

    timer = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
    //#endregion

    //Score
    ScoreText = this.add.text(16, 16, 'Stars: 0', {fontSize: '50px', fill: '#000'}).setScrollFactor(0);

    //Colider player, platforms
    this.physics.add.collider(player, platforms);


    //#region Stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 140,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.physics.add.collider(stars, platforms);


    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.6, 1));

    });

    this.physics.add.overlap(player, stars, collectStar, null, this);
    //#endregion

    //Camera settings
    this.cameras.main.setBounds(0, 0, worldWidth, 700);
    this.physics.world.setBounds(0, 0, worldWidth, 700);

    // Start camera follow
    this.cameras.main.startFollow(player);
}

function update ()
{
    //#region Movement
    if (cursors.left.isDown)
    {
        player.setVelocityX(-600);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(600);
    }
    else
    {
        player.setVelocityX(0);
    }
    if (cursors.up.isDown)
    {
        player.setVelocityY(-330);
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityY(330)
    }
    else
    {
        player.setVelocityY(0);
    }
    //#endregion
}

//Collect star func
function collectStar (player, star)
{
    star.disableBody(true, true);

    Score += 1;
    ScoreText.setText('Stars: ' + Score);

    if (Score == 138){

        //End game text
        this.add.text(300, 300, 'Your game time: ' + timeElapsed,  {fontSize: '50px', fill: '#000'}).setScrollFactor(0);
        this.add.text(200,360, 'For restart press: ENTER', {fontSize: '50px', fill: '#000'}).setScrollFactor(0);

        //Reload canvas
        document.addEventListener('keyup', function(event) {
            if (event.code === 'Enter') {
                window.location.reload();
            }
        });
    }
}

//Timer update func
function updateTimer() {
    timeElapsed++;
    TimerText.setText('Time: ' + timeElapsed);
}