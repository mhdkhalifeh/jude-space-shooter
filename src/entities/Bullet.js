import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player_laser");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.09);
        this.setDepth(9);

        this.speed = 650;
    }

    update() {
        this.y -= this.speed * (this.scene.game.loop.delta / 1000);

        if (this.y < -50) {
            this.destroy();
        }
    }
}