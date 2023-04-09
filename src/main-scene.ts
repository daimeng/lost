import { GameObjects, Input, Scene, Tilemaps } from "phaser"
import { Entities, Entity } from "./entity"
import { genmaze } from "./gen"


function randRoom() {
  const room = new Array(5).fill(null).map((_, i, arr) => {
    return new Array(5).fill(0).map(() => Math.floor(Math.random() * 8))
  })

  room[0][0] = 51 + Math.floor(Math.random() * 4)
  room[4][0] = 51 + Math.floor(Math.random() * 4)
  room[0][4] = 51 + Math.floor(Math.random() * 4)
  room[4][4] = 51 + Math.floor(Math.random() * 4)

  return room
}

const NULLF = function () { }

export default class MainScene extends Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  keys: {
    SPACE: Input.Keyboard.Key
    X: Input.Keyboard.Key
    Z: Input.Keyboard.Key
  }
  p: Entity
  entities: Entities
  map: Tilemaps.Tilemap
  layer: Tilemaps.TilemapLayer

  constructor() {
    super('demo')
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.keys = {
      SPACE: this.input.keyboard.addKey('SPACE'),
      X: this.input.keyboard.addKey('X'),
      Z: this.input.keyboard.addKey('Z'),
    }
    this.entities = new Entities(this)
  }

  create() {
    this.cameras.main.setZoom(2, 2)
    this.cameras.main.centerOn(40, 40)
    this.cameras.main.setRoundPixels(true)

    const anim = this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('sprites', { start: 0, end: 2 }),
      frameRate: 4
    })

    // const data = new Array(40).fill(null).map((_, i, arr) => {
    //   if (i === 0 || i === arr.length - 1) {
    //     return new Array(60).fill(1)
    //   }
    //   const row = new Array(60).fill(0)
    //   row[0] = 1
    //   row[row.length - 1] = 1
    //   return row
    // })

    const tiles = randRoom()

    this.map = this.make.tilemap({ data: tiles, tileWidth: 16, tileHeight: 16 })
    this.map.addTilesetImage("tiles")
    this.layer = this.map.createLayer(0, "tiles", 0, 0)
    this.map.setCollision([51, 52, 53, 54])
    // for (let i = 0; i < data.length; i++) {
    //   const row = data[i]
    //   for (let j = 0; j < row.length; j++) {
    //     const idx = i * row.length + j
    //     map.setCollision(idx, row[j] === 1)
    //   }
    // }
    // const debugGraphics = this.add.graphics()
    // layer.renderDebug(debugGraphics)else
    this.entities.setDepth(1)
    this.p = this.entities.spawn(30, 50)
    this.physics.add.collider(this.entities, this.layer)

    this.p.spr.play({ key: 'idle', repeat: -1 })

    this.game.events.emit('main-loaded')
  }

  update() {
    if (this.cursors.left.isDown) {
      this.p.setVelocityX(-100)
    } else if (this.cursors.right.isDown) {
      this.p.setVelocityX(100)
    } else {
      this.p.setVelocityX(0)
    }

    if (this.cursors.up.isDown) {
      this.p.setVelocityY(-100)
    } else if (this.cursors.down.isDown) {
      this.p.setVelocityY(100)
    } else {
      this.p.setVelocityY(0)
    }

    this.p.body.velocity = this.p.body.velocity.normalize()
    this.p.body.velocity.x *= 100
    this.p.body.velocity.y *= 100

    this.game.events.emit('UPDATE')

    if (this.p.x < 0) {
      this.p.x += 80
      this.map.putTilesAt(randRoom(), 0, 0)
    } else if (this.p.x > 80) {
      this.p.x -= 80
      this.map.putTilesAt(randRoom(), 0, 0)
    }

    if (this.p.y < 0) {
      this.p.y += 80
      this.map.putTilesAt(randRoom(), 0, 0)
    } else if (this.p.y > 80) {
      this.p.y -= 80
      this.map.putTilesAt(randRoom(), 0, 0)
    }
  }
}
