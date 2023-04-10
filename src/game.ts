import Phaser, { Loader } from "phaser";
import { LoaderScene } from "./loader-scene";
import MainScene from "./main-scene";
import { UiScene } from "./ui-scene";

export const MAZEW = 8
export const MAZEH = 8

export const CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // debug: true
    }
  },
  scene: [LoaderScene, MainScene, UiScene]
}

export const game = new Phaser.Game(CONFIG);
