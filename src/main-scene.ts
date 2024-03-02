import { GameObjects, Input, Scene, Tilemaps } from "phaser"
import { Entities, Entity } from "./entity"
import { MAZEH, MAZEW, P, RPRE } from "./game"
import { coords21, genmaze, Point } from "./gen"
import seedrandom from 'seedrandom'
import { EMPTYROOM, randRoom } from "./room"

const NULLF = function () { }

enum Dir {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

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

  actions: Array<Generator> = []

  marks: Array<Array<number>>

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

    // empty marks array
    this.marks = new Array(MAZEH).fill(null).map((_, i) => new Array(MAZEW).fill(0))

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
    console.log(x, y)
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

    this.game.events.on('solve', this.run_solve)
  }

  *walk(dir: Dir) {
    const x = this.curr[0]
    const y = this.curr[1]

    while (
      (x === this.curr[0] && y === this.curr[1])
      || this.p.x > 60 || this.p.x < 15
      || this.p.y > 60 || this.p.y < 15
    ) {
      switch (dir) {
        case Dir.UP:
          this.cursors.up.isDown = true
          break
        case Dir.DOWN:
          this.cursors.down.isDown = true
          break
        case Dir.LEFT:
          this.cursors.left.isDown = true
          break
        case Dir.RIGHT:
          this.cursors.right.isDown = true
          break
      }
      yield
    }
    console.log(this.p.y)
    this.cursors.up.isDown = false
    this.cursors.down.isDown = false
    this.cursors.left.isDown = false
    this.cursors.right.isDown = false
  }

  public run_solve = () => {
    const solve = this.solve()
    this.actions.push(solve)
  }

  public *solve() {
    yield* this.walk(Dir.UP)
    yield* this.walk(Dir.LEFT)
    // await this.walk(Dir.RIGHT)
    // this.walk(Dir.DOWN)
    // this.walk(Dir.LEFT)
  }

  update() {
    if (this.actions.length) {
      const action = this.actions[0]

      if (action.next(this).done) {
        this.actions.shift()
      }
    }

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
