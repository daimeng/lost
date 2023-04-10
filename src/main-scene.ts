import { GameObjects, Input, Scene, Tilemaps } from "phaser"
import { Entities, Entity } from "./entity"
import { MAZEH, MAZEW } from "./game"
import { coords21, genmaze, Point } from "./gen"
import seedrandom from 'seedrandom'

const RPRE = Math.random()
const RSIZE = 5

const EMPTYROOM = new Array(RSIZE).fill(null).map((_, i, arr) => {
  return new Array(RSIZE).fill(0)
})

function randRoom(borders: number, x: number, y: number) {
  const rng = seedrandom(`${RPRE}-${x}-${y}`)
  const room = new Array(RSIZE).fill(null).map((_, i, arr) => {
    return new Array(RSIZE).fill(0).map(() => Math.max(Math.floor(rng() * 16), 0) - 8)
  })

  if (!(borders & 0b0001)) {
    for (let i = 0; i < RSIZE; i++) {
      room[0][i] = 51 + Math.floor(rng() * 4)
    }
  }

  if (!(borders & 0b0100)) {
    for (let i = 0; i < RSIZE; i++) {
      room[RSIZE - 1][i] = 51 + Math.floor(rng() * 4)
    }
  }

  if (!(borders & 0b0010)) {
    for (let i = 0; i < RSIZE; i++) {
      room[i][RSIZE - 1] = 51 + Math.floor(rng() * 4)
    }
  }

  if (!(borders & 0b1000)) {
    for (let i = 0; i < RSIZE; i++) {
      room[i][0] = 51 + Math.floor(rng() * 4)
    }
  }

  room[0][0] = 51 + Math.floor(rng() * 4)
  room[4][0] = 51 + Math.floor(rng() * 4)
  room[0][4] = 51 + Math.floor(rng() * 4)
  room[4][4] = 51 + Math.floor(rng() * 4)

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
  maze: Array<[number, number]>
  grid: Array<Array<number>>
  curr: Point

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

  genmaze() {
    this.maze = genmaze(MAZEH, MAZEW)
    this.grid = new Array(MAZEH).fill(null).map((_, i) => {
      return new Array(MAZEW).fill(0).map((_, j) => {
        let border = 0
        const coord = coords21(j, i, MAZEW)
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j, i - 1, MAZEW)) !== -1) {
          border |= 1
        }
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j + 1, i, MAZEW)) !== -1) {
          border |= 2
        }
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j, i + 1, MAZEW)) !== -1) {
          border |= 4
        }
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j - 1, i, MAZEW)) !== -1) {
          border |= 8
        }

        return border
      })
    })

    this.game.events.emit('genmaze', this.grid)
  }

  switchRoom(x: number, y: number) {
    const borders = this.grid[y][x]
    this.map.putTilesAt(randRoom(borders, x, y), 0, 0)
    this.curr[0] = x
    this.curr[1] = y
  }

  create() {
    this.cameras.main.setZoom(2, 2)
    this.cameras.main.centerOn(40, 40)
    this.cameras.main.setRoundPixels(true)

    this.genmaze()

    this.anims.create({
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

    this.curr = [
      Math.floor(Math.random() * MAZEW),
      Math.floor(Math.random() * MAZEH),
    ]

    this.map = this.make.tilemap({ data: EMPTYROOM, tileWidth: 16, tileHeight: 16 })
    this.map.addTilesetImage("tiles")
    this.layer = this.map.createLayer(0, "tiles", 0, 0)
    this.map.setCollision([51, 52, 53, 54])

    this.switchRoom(this.curr[0], this.curr[1])
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
      this.switchRoom(this.curr[0] - 1, this.curr[1])
    } else if (this.p.x > 80) {
      this.p.x -= 80
      this.switchRoom(this.curr[0] + 1, this.curr[1])
    }

    if (this.p.y < 0) {
      this.p.y += 80
      this.switchRoom(this.curr[0], this.curr[1] - 1)
    } else if (this.p.y > 80) {
      this.p.y -= 80
      this.switchRoom(this.curr[0], this.curr[1] + 1)
    }
  }
}
