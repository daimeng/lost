import { Scene } from "phaser"
import Sprites from './assets/sprites.png'
import Tiles from './assets/colored_packed.png'

export class LoaderScene extends Scene {
  constructor() {
    super('loader')
  }

  preload() {
    this.load.spritesheet('tiles', Tiles, { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('sprites', Sprites, { frameWidth: 16, frameHeight: 16 })
  }

  create() {
    this.scene
      .launch('demo')
      .launch('ui')
      .remove()
  }
}
