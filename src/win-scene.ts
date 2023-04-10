import { Scene } from "phaser";
import { CONFIG, GHEIGHT, GWIDTH } from "./game";

export class WinScene extends Scene {
  constructor() {
    super('win')
  }

  create() {
    this.add.text(GWIDTH / 2, GHEIGHT / 2, 'You Win!', { fontSize: '36px' }).setOrigin(0.5)
  }
}
