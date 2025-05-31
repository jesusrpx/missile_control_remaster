class MissileCommand extends Phaser.Scene {
    constructor() {
        super("MissileCommand");
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.image("enemy_plane", "assets/enemy_plane.png"); // Avión enemigo
        this.load.image("enemy_missile", "assets/enemy_missile.png"); // Misil enemigo
        this.load.image("bullet", "assets/bullet.png"); // Proyectil aliado
        this.load.image("explosion", "assets/explosion.png"); // Explosión
        this.load.image("base", "assets/base.png"); // Base defensiva
        this.load.image("crosshair", "assets/crosshair.png"); // Mira
    }

    create() {
        this.add.image(470, 320, "background");

        this.bases = this.physics.add.staticGroup();
        const basePositions = [150, 470, 790];
        this.baseObjects = [];

        basePositions.forEach(x => {
            const base = this.bases.create(x, 600, "base").setScale(1);
            this.baseObjects.push(base);
        });

        this.crosshair = this.add.sprite(470, 300, "crosshair").setScale(0.5).setDepth(10);

        this.crosshairSpeed = 300;


        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.score = 0;
        this.scoreText = this.add.text(20, 20, "Score: 0", {
            fontSize: "24px",
            fill: "#fff"
        }).setDepth(10);

        this.enemies = this.physics.add.group();
        this.enemyMissiles = this.physics.add.group();
        this.playerBullets = this.physics.add.group();

        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 1500,
            callback: this.shootMissileFromEnemy,
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(this.playerBullets, this.enemyMissiles, this.hitMissile, null, this);
        this.physics.add.collider(this.enemyMissiles, this.bases, this.hitBase, null, this);
        this.physics.add.collider(this.playerBullets, this.enemies, this.hitEnemy, null, this);
    }

    update(time, delta) {
        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) moveX = -1;
        else if (this.cursors.right.isDown) moveX = 1;
        if (this.cursors.up.isDown) moveY = -1;
        else if (this.cursors.down.isDown) moveY = 1;

        const speed = this.crosshairSpeed * (delta / 1000);
        this.crosshair.x += moveX * speed;
        this.crosshair.y += moveY * speed;

        this.crosshair.x = Phaser.Math.Clamp(this.crosshair.x, 0, 940);
        this.crosshair.y = Phaser.Math.Clamp(this.crosshair.y, 0, 600);

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            const bullet = this.playerBullets.create(470, 600, "bullet");
            bullet.setScale(1);

            const dx = this.crosshair.x - bullet.x;
            const dy = this.crosshair.y - bullet.y;
            const angle = Math.atan2(dy, dx);
            const speed = 600;

            bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(0, 940);
        const y = 50;
        const enemy = this.enemies.create(x, y, "enemy_plane").setScale(1);
        enemy.setVelocityX(Phaser.Math.Between(-100, 100));
        enemy.setImmovable(true);
    }

    shootMissileFromEnemy() {
        const enemies = this.enemies.getChildren();
        if (enemies.length === 0) return;

        const enemy = Phaser.Utils.Array.GetRandom(enemies);
        const missile = this.enemyMissiles.create(enemy.x, enemy.y + 20, "enemy_missile");
        missile.setScale(1);
        missile.setVelocityY(Phaser.Math.Between(100, 200));
        missile.setVelocityX(Phaser.Math.Between(-30, 30));
    }

    hitMissile(bullet, missile) {
        bullet.destroy();
        missile.destroy();
        this.createExplosion(missile.x, missile.y);
        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
    }

    hitBase(missile, base) {
        missile.destroy();
        this.createExplosion(base.x, base.y);
        base.disableBody(true, true);

        const allDestroyed = this.baseObjects.every(b => !b.active);
        if (allDestroyed) {
            this.scene.pause();
            this.add.text(300, 300, "GAME OVER\nPuntaje final: " + this.score, {
                fontSize: "32px",
                fill: "#f00",
                align: "center"
            });
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.createExplosion(enemy.x, enemy.y);
        this.score += 30;
        this.scoreText.setText("Score: " + this.score);
    }

    createExplosion(x, y) {
        const explosion = this.add.image(x, y, "explosion").setScale(1).setDepth(10);
        this.time.delayedCall(500, () => {
            explosion.destroy();
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 940,
    height: 640,
    backgroundColor: "#000",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        },
    },
    scene: MissileCommand,
};

const game = new Phaser.Game(config);