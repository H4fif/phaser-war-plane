import Phaser from "phaser";

export default class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'explosion');
    scene.add.existing(this);
    this.play('explode');
  }

  // call manually on update
  // explode() {
  //   this.play('explode');
  // }
}