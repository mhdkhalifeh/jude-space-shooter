import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.12);
        this.setDepth(10);
        this.body.setCollideWorldBounds(true);

        this.moveSpeed = 0.14;
        this.maxTilt = 10;
        this.isHit = false;
    }

    update(pointer) {
        if (this.isHit) {
            this.angle = Phaser.Math.Linear(this.angle, 0, 0.2);
            return;
        }

        const oldX = this.x;

        const targetX = Phaser.Math.Clamp(
            pointer.worldX,
            80,
            this.scene.scale.width - 80
        );

        const targetY = Phaser.Math.Clamp(
            pointer.worldY,
            100,
            this.scene.scale.height - 80
        );

        this.x = Phaser.Math.Linear(this.x, targetX, this.moveSpeed);
        this.y = Phaser.Math.Linear(this.y, targetY, this.moveSpeed);

        const deltaX = this.x - oldX;
        const targetTilt = Phaser.Math.Clamp(deltaX * 3, -this.maxTilt, this.maxTilt);

        this.angle = Phaser.Math.Linear(this.angle, targetTilt, 0.18);

        this.setVisible(true);
        this.setAlpha(1);
    }
}