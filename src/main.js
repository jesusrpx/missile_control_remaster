import Phaser from 'phaser'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1c280b',
  scene: {
    preload,
    create,
    update
  }
}

// Instancia de Phaser
const game = new Phaser.Game(config)

function preload () {
  // Carga de recursos
  //this.load.image('background', 'assets/background.png')
}

function create () {
  // Inicializacion de elemento del juego
  //this.add.image(400, 300, 'background')
}

function update () {
  // Lógica de actualización del juego
}