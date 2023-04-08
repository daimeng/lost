import { GameObjects, Physics, Scene, Actions, Geom } from "phaser"
import { addOne, HALFPI, TWOPI } from "./utils/math"

export class Entity extends GameObjects.Container {
  public aimVec: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0)
  private _aimAngle: number = 0
  set aimAngle(v: number) {
    if (v > HALFPI) v = HALFPI
    if (v < -HALFPI) v = -HALFPI
    this._aimAngle = v
    this.aimVec.x = Math.cos(this._aimAngle)
    this.aimVec.y = Math.sin(this._aimAngle)
  }
  get aimAngle() {
    return this._aimAngle
  }
  get facingVal() {
    return this.spr.flipX ? -1 : 1
  }
  body: Phaser.Physics.Arcade.Body
  spr: GameObjects.Sprite

  constructor(scene: Scene, x?: number, y?: number) {
    super(scene, x, y)
    this.setActive(false)
    this.setVisible(false)

    this.setSize(12, 12)
    scene.physics.add.existing(this, false)

    this.spr = scene.add.sprite(0, 0, 'sprites')
    this.add(this.spr)

    scene.add.existing(this)
  }

  setVelocityX(v: number) {
    if (v > 0) {
      this.spr.flipX = false
    } else if (v < 0) {
      this.spr.flipX = true
    }
    this.body.setVelocityX(v)
  }

  setVelocityY(v: number) {
    this.body.setVelocityY(v)
  }

  kill() {
    this.setActive(false)
    this.setVisible(false)
    this.body.setEnable(false)
  }

  preUpdate(time: number, delta: number) {
  }
}

export class Entities extends GameObjects.Group {
  constructor(scene: Scene) {
    super(scene)

    for (let i = 0; i < 100; i++) {
      const entity = new Entity(scene, 0, 0)
      entity.body.setEnable(false)
      this.add(entity)
    }
  }

  spawn(x: number, y: number): Entity {
    let entity = this.getFirstDead(false) as Entity
    if (entity) {
      entity.setActive(true)
      entity.setVisible(true)
      entity.setPosition(x, y)
      entity.body.setEnable(true)
    }
    return entity
  }
}
