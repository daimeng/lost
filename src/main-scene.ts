import { GameObjects, Input, Scene, Tilemaps } from "phaser"
import { Entities, Entity } from "./entity"
import { MAZEH, MAZEW, P, RPRE } from "./game"
import { coords21, genmaze, Point } from "./gen"
import seedrandom from 'seedrandom'

const RSIZE = 5

const EMPTYROOM = new Array(RSIZE).fill(null).map((_, i, arr) => {
  return new Array(RSIZE).fill(0)
})

function randRoom(borders: number, x: number, y: number) {
  const rng = seedrandom(`${RPRE}-${x}-${y}`)
  const room = new Array(RSIZE).fill(null).map((_, i, arr) => {
    return new Array(RSIZE).fill(0).map(() => Math.max(Math.floor(rng() * 7), 0) + 1)
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
  goal: Point
  home: Phaser.Types.Physics.Arcade.SpriteWithStaticBody
  pconf: {
    x: number,
    y: number,
    gx: number,
    gy: number,
  }

  constructor() {
    super('demo')
  }

  preload() {
    const rng = seedrandom(RPRE + '-pos')

    this.pconf = {
      x: Math.floor(rng() * MAZEW),
      y: Math.floor(rng() * MAZEH),
      gx: Math.floor(rng() * MAZEW),
      gy: Math.floor(rng() * MAZEH),
    }

    if (P) {
      this.pconf = JSON.parse(atob(P))
    }

    this.cursors = this.input.keyboard.createCursorKeys()
    this.keys = {
      SPACE: this.input.keyboard.addKey('SPACE'),
      X: this.input.keyboard.addKey('X'),
      Z: this.input.keyboard.addKey('Z'),
    }
    this.entities = new Entities(this)
    this.home = this.physics.add.staticSprite(40, 40, 'tiles', 986)
    this.home.setActive(false)
    this.home.setVisible(false)
    this.home.body.enable = false
  }

  genmaze() {
    this.maze = genmaze(MAZEH, MAZEW)

    // this.maze = []
    // Justin
    // p=eyJ4IjoxLCJ5IjowLCJneCI6NiwiZ3kiOjd9
    // const maze = [
    //   [1, 9],
    //   [9, 17],
    //   [17, 18],
    //   [18, 26],
    //   [26, 27],
    //   [27, 28],
    //   [28, 29],

    //   // middle route
    //   [29, 21],
    //   [21, 13],
    //   [13, 12],

    //   [29, 30],
    //   [30, 38],
    //   [38, 46],
    //   [46, 54],
    //   [54, 62],
    // ]

    // Nemo
    // p=eyJ4IjowLCJ5IjowLCJneCI6NywiZ3kiOjd9
    // const maze = [
    //   [0, 8],
    //   [8, 9],

    //   // side 1
    //   [9, 10],
    //   [10, 2],
    //   // horiz 1
    //   [2, 3],
    //   [3, 4],
    //   [4, 5],
    //   [5, 6],
    //   [6, 7],
    //   // vert 1
    //   [6, 14],
    //   [14, 22],
    //   [22, 30],
    //   [30, 38],
    //   [38, 46],

    //   // vert 1 sides
    //   [22, 21],
    //   [22, 23],
    //   [38, 39],
    //   [38, 37],
    //   [37, 36],
    //   [36, 44],

    //   // vert 2
    //   [4, 12],
    //   [12, 20],
    //   [20, 28],
    //   [28, 29],
    //   [28, 27],
    //   [27, 35],

    //   [9, 17],
    //   [17, 25],
    //   [25, 33],
    //   [33, 34], // side trap
    //   [33, 41],
    //   [41, 40], // side trap
    //   [41, 42],
    //   [42, 43],
    //   [43, 44],
    //   [44, 52],
    //   [52, 51],
    //   [51, 59],
    //   [59, 60],
    //   [60, 61],
    //   [61, 53],
    //   [53, 54],
    //   [54, 55],
    //   [55, 47], // top trap
    //   [55, 63],

    //   // last side corridor
    //   [59, 58],
    //   [58, 57],
    //   [57, 56],
    //   [56, 48],
    //   [57, 49],
    // ]

    // // reflect
    // maze.forEach(([a, b]) => {
    //   this.maze.push([a, b], [b, a])
    // })

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

    this.game.events.emit('genmaze', this.grid, this.pconf)
  }

  switchRoom(x: number, y: number) {
    const borders = this.grid[y][x]
    const room = randRoom(borders, x, y)
    this.curr[0] = x
    this.curr[1] = y
    this.pconf.x = x
    this.pconf.y = y
    // set home if in current room
    // if (this.curr[0] === this.goal[0] && this.curr[1] === this.goal[1]) {
    //   room[2][2] = 986
    // }
    if (this.curr[0] === this.goal[0] && this.curr[1] === this.goal[1]) {
      this.home.setActive(true)
      this.home.setVisible(true)
      this.home.body.enable = true
      room[2][2] = 0
    } else {
      this.home.setActive(false)
      this.home.setVisible(false)
      this.home.body.enable = false
    }
    this.map.putTilesAt(room, 0, 0)

    this.game.events.emit('genmaze', this.grid, this.pconf)
  }

  create() {
    this.cameras.main.setZoom(3, 3)
    this.cameras.main.centerOn(40, 40)
    this.cameras.main.setRoundPixels(true)

    this.genmaze()

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('sprites', { start: 0, end: 2 }),
      frameRate: 4
    })

    this.curr = [
      this.pconf.x,
      this.pconf.y,
    ]

    this.goal = [
      this.pconf.gx,
      this.pconf.gy,
    ]

    this.map = this.make.tilemap({ data: EMPTYROOM, tileWidth: 16, tileHeight: 16 })
    this.map.addTilesetImage("tiles")
    this.layer = this.map.createLayer(0, "tiles", 0, 0)
    this.map.setCollision([51, 52, 53, 54])

    this.physics.add.overlap(this.home, this.entities, () => {
      this.scene.launch('win')
      this.scene.stop()
    })

    this.switchRoom(this.curr[0], this.curr[1])
    this.entities.setDepth(1)
    this.p = this.entities.spawn(24, 24)
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
