import Phaser from "phaser";
import Scene1 from "./Scene1";
import Scene2 from "./Scene2";

export const windowWidth = window.innerWidth;
export const windowHeight = window.innerHeight;

export const gameSettings = {
  playerSpeed: 200,
};

export const config = {
  width: 256,
  height: 272,
  backgroundColor: 0x000000,
  scene: [Scene1, Scene2],
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    },
  },
  scale: {
    // ignore aspect ratio:
    // mode: Phaser.Scale.RESIZE,

    // keep aspect ratio:
    mode: Phaser.Scale.FIT,
    //mode: Phaser.Scale.ENVELOP, // larger than Scale.FIT
    // mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH, // auto width
    // mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT, // auto height

    // autoCenter: Phaser.Scale.NO_CENTER,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    //autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    //autoCenter: Phaser.Scale.CENTER_VERTICALLY,

  },
};

var game = new Phaser.Game(config);

function resize() {
  var canvas = document.querySelector("canvas");
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = config.width / config.height;

  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = (windowWidth / gameRatio) + "px";
  } else {
    canvas.style.width = (windowHeight * gameRatio) + "px";
    canvas.style.height = windowHeight + "px";
  }
}

// resize();