import Phaser from "phaser";
import { config, gameSettings, windowHeight, windowWidth } from "./main";
import Beam from "./beam";
import Explosion from "./Explosion";

const baseSpeed = 3; // increase to slow it down, decrease to speed up

export default class Scene2 extends Phaser.Scene {
  constructor() {
    super('playGame');
  }

  create() {
    // this.background = this.add.image(0, 0, 'background');
    // this.background.setOrigin(0, 0);

    // this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
    // this.background = this.add.tileSprite(0, 0, this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    this.background = this.add.tileSprite(this.cameras.main.width / 2, this.cameras.main.height / 2, config.width, config.height, 'background');

    var graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(config.width, 0);
    graphics.lineTo(config.width, 20);
    graphics.lineTo(0, 20);
    graphics.lineTo(0, 0);
    graphics.closePath();
    graphics.fillPath();
    // let scaleX = this.cameras.main.width / this.background.width
    // let scaleY = this.cameras.main.height / this.background.height
    // let scale = Math.max(scaleX, scaleY)
    // this.background.setScale(scale).setScrollFactor(0)

    // this.add.text(20, 20, 'Playing game', { font: '25px Arial', fill: 'yellow' });

    this.score = 0;
    this.scoreLabel = this.add.bitmapText(10, 5, 'pixelFont', `SCORE ${this.score.toString().padStart(9, '0')}`, 16);

    this.beamSound = this.sound.add('audio_beam');
    this.explosionSound = this.sound.add('audio_explosion');
    this.pickupSound = this.sound.add('audio_pickup');

    this.music = this.sound.add('music');

    const musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    };

    this.music.play(musicConfig);


    this.ship1 = this.add.sprite(config.width / 2 - 50, config.height / 2, 'ship');
    this.ship2 = this.add.sprite(config.width / 2, config.height / 2, 'ship2');
    this.ship3 = this.add.sprite(config.width / 2 + 50, config.height / 2, 'ship3');
    this.ship1.setFlipY(true);
    this.ship2.setFlipY(true);
    this.ship3.setFlipY(true);


    this.powerUps = this.physics.add.group();

    this.generatePowerUps();

    this.ship1.play('ship1_anim');
    this.ship2.play('ship2_anim');
    this.ship3.play('ship3_anim');

    this.ship1.setInteractive();
    this.ship2.setInteractive();
    this.ship3.setInteractive();

    this.input.on('gameobjectdown', this.destroyShip, this);

    this.player = this.physics.add.sprite(config.width / 2 - 8, config.height - 64, 'player');
    this.player.play('thrust');
    this.player.setCollideWorldBounds(true);

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.projectiles = this.add.group();

    this.physics.add.collider(this.projectiles, this.powerUps, (projectile, powerUp) => {
      projectile.destroy();
    });

    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);

    this.enemies = this.physics.add.group();
    this.enemies.add(this.ship1);
    this.enemies.add(this.ship2);
    this.enemies.add(this.ship3);

    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);

    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);
  }

  movePlayerManager() {
    const { left, right, up, down } = this.cursorKeys;

    if (left.isDown) {
      this.player.setVelocityX(-gameSettings.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(gameSettings.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (up.isDown) {
      this.player.setVelocityY(-gameSettings.playerSpeed);
    } else if (down.isDown) {
      this.player.setVelocityY(gameSettings.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  moveShip(ship, speed) {
    ship.y += speed;

    if (ship.y > config.height + ship.height) {
      this.resetShipPos(ship);
    }
  }

  resetShipPos(ship) {
    ship.y = 0;
    const randomX = Phaser.Math.Between(0, config.width);
    ship.x = randomX;
  }

  destroyShip(pointer, gameObject) {
    gameObject.setTexture('explosion');
    gameObject.play('explode');
  }

  shootBeam() {
    var beam = new Beam(this);
    this.beamSound.play();
  }

  generatePowerUps() {
    var maxObjects = 4;

    for (var i = 0; i < maxObjects; i++) {
      var powerUp = this.physics.add.sprite(16, 16, 'power-up');
      this.powerUps.add(powerUp);
      powerUp.setRandomPosition(0, 0, config.width, config.height);

      if (Math.random() > 0.5) {
        powerUp.play('red');
      } else {
        powerUp.play('gray');
      }

      powerUp.setVelocity(100, 100);
      powerUp.setCollideWorldBounds(true);
      powerUp.setBounce(1);
    }

  }

  pickPowerUp(player, powerUp) {
    if (this.player.alpha < 1) return;
    // 1. how to hide and disable collisoin of an object but keep it on the scene
    // powerUp.disableBody(true, true);

    // 2. remove the object from the scene
    powerUp.destroy();

    this.pickupSound.play();
  }

  resetPlayer() {
    const x = config.width / 2 - 8;
    const y = config.height - 64;
    this.player.enableBody(true, x, y, true, true);
    this.player.alpha = 0.5;

    var tween = this.tweens.add({
      targets: this.player,
      y: config.height - 64,
      ease: 'Power1',
      duration: 1500,
      repeat: 0,
      onComplete: () => {
        this.player.alpha = 1;
      },
      callbackScope: this,
    })

    tween.play();
  }

  hurtPlayer(player, enemy) {
    if (this.player.alpha < 1) return;

    this.resetShipPos(enemy);

    var explosion = new Explosion(this, this.player.x, this.player.y);
    player.disableBody(true, true);

    this.time.addEvent({
      delay: 1000,
      callback: this.resetPlayer,
      callbackScope: this,
      loop: false,
    });

    this.explosionSound.play();
  }

  hitEnemy(projectile, enemy) {
    var explosion = new Explosion(this, enemy.x, enemy.y);
    projectile.destroy();
    this.resetShipPos(enemy);
    this.score += 15;
    this.scoreLabel.text = `SCORE ${this.score.toString().padStart(9, '0')}`;
    this.explosionSound.play();
  }

  update() {
    this.moveShip(this.ship1, 1 / baseSpeed);
    this.moveShip(this.ship2, 2 / baseSpeed);
    this.moveShip(this.ship3, 3 / baseSpeed);

    this.background.tilePositionY -= 0.5;

    this.movePlayerManager();

    // if (!this.powerUps.getChildren().length) {
    //   this.generatePowerUps();
    // }

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      if (this.player.active) {
        this.shootBeam();
      }
    }

    for (let i = 0; i < this.projectiles.getChildren().length; i++) {
      var beam = this.projectiles.getChildren()[i];
      beam.update();
    }
  }
}