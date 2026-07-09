import Phaser from "phaser";

export default class Mine extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "space_mine");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hp = 2;
        this.scoreValue = 60;
        this.triggerRadius = 70;
        this.explosionRadius = 95;
        this.armDelay = 500;
        this.spawnTime = scene.time.now;

        this.setDepth(9);
        this.setScale(0.09);
    }

    takeDamage(amount = 1) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    isArmed() {
        return this.scene.time.now >= this.spawnTime + this.armDelay;
    }

    update() {
        this.rotation += 0.025;

        if (!this.isArmed()) {
            this.alpha = 0.55 + Math.sin(this.scene.time.now * 0.02) * 0.25;
        } else {
            this.alpha = 0.85 + Math.sin(this.scene.time.now * 0.01) * 0.15;
        }

        this.y += 0.25;

        if (this.y > this.scene.scale.height + 80) {
            this.destroy();
        }
    }
}