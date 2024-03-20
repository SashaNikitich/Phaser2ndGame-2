var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
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
var objects;
var lives = 5;
var gameOver = false;

function preload() {
    // Load assets
    this.load.image('background', 'assets/background/background.png');
    this.load.image('platform', 'assets/background/tiles/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('stone', 'assets/objects/Stone.png');
    this.load.image('tree1', 'assets/objects/Tree_1.png');
    this.load.image('start', 'assets/background/tiles/start.png');
    this.load.image('middle', 'assets/background/tiles/middle.png');
    this.load.image('end', 'assets/background/tiles/end.png');
    this.load.image('bomb', 'assets/bomb.png')
    this.load.image('enemy', 'assets/rocket (2).png')
    this.load.spritesheet('gg', 'assets/plane.png', { frameWidth: 90, frameHeight: 90 });
}

function create() {

    //#region Background
    this.background = this.add.image(0, 0, "background")
        .setOrigin(0, 0)
        .setScrollFactor(0);

    //Creating platforms
    platforms = this.physics.add.staticGroup();

    for (var x = 0; x <= worldWidth; x = x + 128) {

        platforms.create(x, 1080 - 128, 'platform')
            .setOrigin(0, 0)
            .refreshBody();

    }

    //Creating multi func for objects
    objects = this.physics.add.staticGroup();

    function createWorldObjects(objects, asset) {
        for (var x = 0; x <= worldWidth; x = x + Phaser.Math.FloatBetween(500, 900)) {

            objects
                .create(x, 1080 - 128, asset)
                .setOrigin(0, 1)
                .setScale(Phaser.Math.FloatBetween(0.8, 1.5,))
                .setDepth(Phaser.Math.Between(1, 10))

        }
    }

    //Collider platforms with objects
    this.physics.add.collider(platforms, objects);

    //Creating objects
    stone = this.physics.add.staticGroup();
    createWorldObjects(stone, 'stone')

    tree = this.physics.add.staticGroup();
    createWorldObjects(tree, 'tree1')

    //Creating levitating platforms
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(500, 700)) {

        var y = Phaser.Math.Between(128, 810);

        platforms.create(x, y, 'start');

        for (var i = 1; i <= Phaser.Math.Between(1, 2); i++) {

            platforms.create(x + 128 * i, y, 'middle');

        }

        platforms.create(x + 128 * i, y, 'end')
    }
    //#endregion

    //#region Player
    player = this.physics.add.sprite(500, 540, 'gg');

    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    //Colider player, platforms
    this.physics.add.collider(player, platforms);

    //#endregion

    //#region Enemy

    enemy = this.physics.add.group({
        key: 'enemy',
        repeat: 10,
        setXY: { x: Phaser.Math.FloatBetween(500, 1000), y: 0, stepX: Phaser.Math.Between(100, 400) }
    });

    enemy.children.iterate(function(child) {
        child.setCollideWorldBounds(true);
    });

    this.physics.add.overlap(player, enemy, hitEnemy, null, this);
    //#endregion

    //#region Timer
    TimerText = this.add.text(16, 60, 'Time: 0', { fontSize: '50px', fill: '#0000FF' }).setScrollFactor(0);

    timer = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
    //#endregion

    //Score
    ScoreText = this.add.text(16, 16, 'Stars: 0', { fontSize: '50px', fill: '#0000FF' }).setScrollFactor(0);

    //Lives
    LivesText = this.add.text(1500, 16, showlife(), { fontSize: '50px', fill: '#0000FF' }).setScrollFactor(0);

    //#region Stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 138,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.physics.add.collider(stars, platforms);


    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.6, 1));
        child.setDepth(10);

    });

    this.physics.add.overlap(player, stars, collectStar, null, this);
    //#endregion

    //#region Bombs
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
    //#endregion

    //Camera settings
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);

    // Start camera follow
    this.cameras.main.startFollow(player);
}

function update() {

    //#region Game over
    if (gameOver)
    {
        this.physics.pause();

        this.add.text(660, 490, 'For restart press: ENTER', { fontSize: '50px', fill: '#0000FF' }).setScrollFactor(0);

        //Reload canvas
        document.addEventListener('keyup', function (event) {
            if (event.code === 'Enter') {
                window.location.reload();
            }
        });
    }
    //#endregion

    //#region Movement
    if (cursors.left.isDown) {
        player.setVelocityX(-600);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(600);
    }
    else {
        player.setVelocityX(0);
    }
    if (cursors.up.isDown) {
        player.setVelocityY(-330);
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(330)
    }
    else {
        player.setVelocityY(0);
    }
    //#endregion

    //#region Enemy movement
    enemy.children.iterate(function(child) {
        // Calculate angle between enemy and player
        let angle = Phaser.Math.Angle.Between(child.x, child.y, player.x, player.y);
    
        // Set the rotation of the rocket/enemy towards the player
        child.rotation = angle;
    
        // Move the enemy towards the player
        let speed = 200;
        let velocityX = Math.cos(angle) * speed;
        let velocityY = Math.sin(angle) * speed;
    
        child.setVelocity(velocityX, velocityY);
    });
    
    //#endregion
}

//Collect star func
function collectStar(player, star) {
    star.disableBody(true, true);

    var bomb = bombs.create(20, 20, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    Score += 1;
    ScoreText.setText('Stars: ' + Score);

    if (Score == 138) {

        this.physics.pause();


        this.add.text(760, 540, 'Your game time: ' + timeElapsed, { fontSize: '50px', fill: '#0000FF' }).setScrollFactor(0);
        this.add.text(660, 490, 'For restart press: ENTER', { fontSize: '50px', fill: '#0000FF' }).setScrollFactor(0);

        //Reload canvas
        document.addEventListener('keyup', function (event) {
            if (event.code === 'Enter') {
                window.location.reload();
            }
        });

    }
}

//Hit enemy func
function hitEnemy(player, enemy) {
    enemy.disableBody(true, true);
    lives -= 5;
    LivesText.setText(showlife());

    if (lives == 0) {
        gameOver = true
    }
}

//Hit bomb func
function hitBomb(player, bomb) {

    bomb.disableBody(true, true);
    lives -= 1;
    LivesText.setText(showlife());

    if (lives == 0) {
        gameOver = true
    }

}

//Timer update func
function updateTimer() {
    timeElapsed++;
    TimerText.setText('Time: ' + timeElapsed);
}

//Life function
function showlife() {
    var lifeLine = ''

    for (i = 0; i < lives; i++) {
        lifeLine = lifeLine + '💖';
    }

    return lifeLine;
}