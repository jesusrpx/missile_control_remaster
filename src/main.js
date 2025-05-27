class MainGame extends Phaser.Scene {

    preload() {
        // Carga de recursos
        this.load.image('background', 'assets/background.png')  // Fondo de pantalla
        this.load.image('tierra', 'assets/t.png')  // Tierra
        this.load.image('spacecraft', 'assets/roger.png')  // Nave Espacial
        this.load.image('bullet', 'assets/bullet.png');
    }

    create() {

        // Carga de cursores
        this.cursors = this.input.keyboard.createCursorKeys();

        // ------ SPRITS ------
        this.background = this.add.image(400, 300, 'background');

        // ------ TERRENO ------

        // ------ FISICAS ------
        this.spacecraft = this.physics.add.sprite(400, 200, 'spacecraft')
        this.enemy = this.physics.add.sprite(700, 450, 'enemy');
        this.enemy.setImmovable(true); // Para que no se mueva cuando choca con el jugador
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(300, 350, 'tierra').refreshBody();
        this.bullets = this.physics.add.group();

        this.spacecraft.setBounce(0.2);
        this.spacecraft.setCollideWorldBounds(true);

        // ------ ESCALAS DE OBJETOS --------
        this.spacecraft.setScale(3);

        // ------- COLLIDERS --------
        this.physics.add.collider(this.spacecraft, this.platforms);
    }

    update() {

        // --------- MOVIMIENTOS DE LOS ELEMENTOS ---------

        // ----- NAVE -----
        this.spacecraft.setVelocity(0);

        // Mover la nave en el eje X
        if (this.cursors.left.isDown) {
            this.spacecraft.setVelocityX(-600);
        }
        else if (this.cursors.right.isDown) {
            this.spacecraft.setVelocityX(600);
        }

        // Crear las balas
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.bullet = this.bullets.create(this.spacecraft.x, this.spacecraft.y, 'bullet');
            this.bullet.setVelocityY(-300); // Disparo hacia la derecha
        }
        // if (this.cursors.up.isDown) {
        //     this.spacecraft.setVelocityY(-600);
        // }
        // else if (this.cursors.down.isDown) {
        //     this.spacecraft.setVelocityY(600);
        // }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 360,
    backgroundColor: '#0000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: MainGame,
}

const game = new Phaser.Game(config);