import Phaser from "phaser";

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = "double") {
        const texture = type === "shield" ? "power_shield" : "power_double";

        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.setScale(0.09);
        this.setDepth(9);

        this.speed = 120;
    }

    update() {
        const delta = this.scene.game.loop.delta / 1000;

        this.y += this.speed * delta;
        this.angle += 1.2;

        if (this.y > this.scene.scale.height + 80) {
            this.destroy();
        }
    }
}