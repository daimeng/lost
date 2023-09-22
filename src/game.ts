import Phaser, { Loader } from "phaser";
import { LoaderScene } from "./loader-scene";
import MainScene from "./main-scene";
import { UiScene } from "./ui-scene";
import { WinScene } from "./win-scene";

export const PARAMS = new URLSearchParams(window.location.search);
export const RPRE = PARAMS.get('seed') || (new Date()).toISOString().slice(0, 10)
export const P = PARAMS.get('p')

export const MAZEW = +(PARAMS.get('w') || 8)
export const MAZEH = +(PARAMS.get('h') || 8)
export const GWIDTH = 1200
export const GHEIGHT = 800

export const CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GWIDTH,
  height: GHEIGHT,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true
    }
  },
  scene: [LoaderScene, MainScene, UiScene, WinScene]
}

export const game = new Phaser.Game(CONFIG);
