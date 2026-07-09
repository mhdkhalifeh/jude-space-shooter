import Phaser from "phaser";

export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetX, targetY) {
        super(scene, x, y, "enemy_plasma");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.06);
        this.setDepth(9);

        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);

        this.speed = 260;
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;

        this.rotation = angle + Math.PI / 2;
    }

    update() {
        const delta = this.scene.game.loop.delta / 1000;

        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;

        if (
            this.y > this.scene.scale.height + 80 ||
            this.y < -80 ||
            this.x < -80 ||
            this.x > this.scene.scale.width + 80
        ) {
            this.destroy();
        }
    }
}