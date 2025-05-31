class MissileLevel extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    init(data) {
        this.level = data?.level || 1;
        this.score = data?.score || 0;
        this.basesLeft = data?.basesLeft || 3;
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.image("tierra", "assets/tierra.png");
        this.load.image("moon", "assets/moon.png");
        this.load.image("enemy_plane", "assets/enemy_plane.png");
        this.load.image("enemy_missile", "assets/enemy_missile.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("explosion", "assets/explosion.png");
        this.load.image("base_segment", "assets/base_segment.png");
        this.load.image("crosshair", "assets/crosshair.png");
    }

    create() {
        // Fondo negro
        this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000).setDepth(-1);
        const bgtierra = this.add.image(0, 0, "tierra").setOrigin(0, 0);
        const platmoon = this.add.image(470, 640, "moon").setOrigin(0.5, 1);

        // Línea horizontal (horizonte)
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x8000ff, 1); // Violeta oscuro
        graphics.strokeLineShape(new Phaser.Geom.Line(0, 100, this.sys.game.config.width, 100));

        // Bases divididas en segmentos
        this.bases = this.physics.add.staticGroup();
        const basePositions = [150, 470, 790]; // Posiciones de las bases
        this.baseObjects = [];

        basePositions.forEach(x => {
            const baseSegments = [];
            for (let i = 0; i < 3; i++) { // Cada base tiene 3 segmentos
                const segment = this.bases.create(x + (i * 20), 600, "base_segment").setScale(1);
                segment.setOrigin(0.5, 1); // Alineación hacia abajo
                baseSegments.push(segment);
            }
            this.baseObjects.push(baseSegments);
        });

        // Mira
        this.crosshair = this.add.sprite(470, 300, "crosshair").setScale(0.5).setDepth(10);
        this.crosshairSpeed = 300;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.scoreText = this.add.text(20, 20, "Score: " + this.score, {
            fontSize: "24px",
            fill: "#fff"
        }).setDepth(10);

        this.enemies = this.physics.add.group();
        this.enemyMissiles = this.physics.add.group();
        this.playerBullets = this.physics.add.group();

        this.spawnEnemies();
        this.shootMissiles();

        this.physics.add.collider(this.playerBullets, this.enemyMissiles, this.hitMissile, null, this);
        this.physics.add.collider(this.enemyMissiles, this.bases, this.hitBaseSegment, null, this);
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
            bullet.reversed = false;
        }

        // Rebote en techo
        this.playerBullets.getChildren().forEach(bullet => {
            if (bullet.y < 10 && !bullet.reversed) {
                bullet.setVelocityX(-bullet.body.velocity.x); // Rebota
                bullet.reversed = true; // Para evitar múltiples rebotes
            }
        });
    }

    spawnEnemies() {
        throw new Error("Must implement spawnEnemies()");
    }

    shootMissiles() {
        throw new Error("Must implement shootMissiles()");
    }

    hitMissile(bullet, missile) {
        bullet.destroy();
        missile.destroy();
        this.createExplosion(missile.x, missile.y);
        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
    }

    hitBaseSegment(missile, baseSegment) {
        missile.destroy();
        this.createExplosion(baseSegment.x, baseSegment.y);
        baseSegment.disableBody(true, true);

        // Verificar si todos los segmentos de una base están destruidos
        const allDestroyed = this.baseObjects.every(base => {
            return base.every(segment => !segment.active);
        });

        if (allDestroyed) {
            this.gameOver();
        } else {
            this.restartLevelIfNoEnemies();
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

    restartLevelIfNoEnemies() {
        if (this.enemies.countActive(true) === 0 && this.enemyMissiles.countActive(true) === 0) {
            const nextLevel = this.scene.key === "Level1" ? "Level2" : this.scene.key === "Level2" ? "Level3" : null;
            if (nextLevel) {
                this.scene.start(nextLevel, {
                    score: this.score,
                    basesLeft: this.baseObjects.filter(b => b.some(segment => segment.active)).length
                });
            } else {
                this.add.text(300, 300, "¡HAS GANADO!\nPuntaje final: " + this.score, {
                    fontSize: "32px",
                    fill: "#0f0",
                    align: "center"
                });
            }
        }
    }

    gameOver() {
        this.scene.pause();
        this.add.text(300, 300, "GAME OVER\nPuntaje final: " + this.score, {
            fontSize: "32px",
            fill: "#f00",
            align: "center"
        });
    }
}

// Niveles
class Level1 extends MissileLevel {
    constructor() {
        super("Level1");
    }

    spawnEnemies() {
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(0, 940);
                const y = 50;
                const enemy = this.enemies.create(x, y, "enemy_plane").setScale(0.5);
                enemy.setVelocityX(Phaser.Math.Between(-100, 100));
                enemy.setImmovable(true);
            },
            callbackScope: this,
            loop: true
        });
    }

    shootMissiles() {
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                const enemies = this.enemies.getChildren();
                if (enemies.length === 0) return;
                const enemy = Phaser.Utils.Array.GetRandom(enemies);
                const missile = this.enemyMissiles.create(enemy.x, enemy.y + 20, "enemy_missile");
                missile.setScale(1);
                missile.setVelocityY(Phaser.Math.Between(100, 200));
                missile.setVelocityX(Phaser.Math.Between(-30, 30));
            },
            callbackScope: this,
            loop: true
        });
    }
}

class Level2 extends MissileLevel {
    constructor() {
        super("Level2");
    }

    spawnEnemies() {
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                const x = Phaser.Math.Between(0, 940);
                const y = 50;
                const enemy = this.enemies.create(x, y, "enemy_plane").setScale(1);
                enemy.setVelocityX(Phaser.Math.Between(-150, 150));
                enemy.setImmovable(true);
            },
            callbackScope: this,
            loop: true
        });
    }

    shootMissiles() {
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                const enemies = this.enemies.getChildren();
                if (enemies.length === 0) return;
                const enemy = Phaser.Utils.Array.GetRandom(enemies);
                const missile = this.enemyMissiles.create(enemy.x, enemy.y + 20, "enemy_missile");
                missile.setScale(1);
                missile.setVelocityY(Phaser.Math.Between(200, 300));
                missile.setVelocityX(Phaser.Math.Between(-50, 50));
            },
            callbackScope: this,
            loop: true
        });
    }
}

class Level3 extends MissileLevel {
    constructor() {
        super("Level3");
    }

    spawnEnemies() {
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                const x = Phaser.Math.Between(0, 940);
                const y = 50;
                const enemy = this.enemies.create(x, y, "enemy_plane").setScale(1);
                enemy.setVelocityX(Phaser.Math.Between(-200, 200));
                enemy.setImmovable(true);
            },
            callbackScope: this,
            loop: true
        });
    }

    shootMissiles() {
        this.time.addEvent({
            delay: 800,
            callback: () => {
                const enemies = this.enemies.getChildren();
                if (enemies.length === 0) return;
                const enemy = Phaser.Utils.Array.GetRandom(enemies);
                const missile = this.enemyMissiles.create(enemy.x, enemy.y + 20, "enemy_missile");
                missile.setScale(1);
                missile.setVelocityY(Phaser.Math.Between(300, 400));
                missile.setVelocityX(Phaser.Math.Between(-80, 80));
            },
            callbackScope: this,
            loop: true
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
    scene: [Level1, Level2, Level3],
};

const game = new Phaser.Game(config);