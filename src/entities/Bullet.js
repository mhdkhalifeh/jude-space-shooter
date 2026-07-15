import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y, "player_laser");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = options.speed ?? 650;
        this.velocityX = options.velocityX ?? 0;
        this.damage = options.damage ?? 1;
        this.piercing = options.piercing ?? 0;
        this.hitTargets = new Set();
        this.homing = options.homing === true;
        this.turnRate = options.turnRate ?? 0.07;

        this.setScale(options.scale ?? 0.09);
        this.setDepth(9);
        this.setTint(options.tint ?? 0xffffff);
        this.rotation = options.rotation ?? 0;
    }

    update() {
        if (this.homing) this.updateHoming();

        const delta = this.scene.game.loop.delta / 1000;
        this.x += this.velocityX * delta;
        this.y -= this.speed * delta;

        if (this.y < -80 || this.x < -80 || this.x > this.scene.scale.width + 80) {
            this.destroy();
        }
    }

    updateHoming() {
        const enemies = this.scene.enemies?.getChildren?.().filter((enemy) => enemy.active && enemy.canBeHit !== false) || [];
        if (enemies.length === 0) return;

        let target = enemies[0];
        let best = Phaser.Math.Distance.Squared(this.x, this.y, target.x, target.y);
        for (let i = 1; i < enemies.length; i++) {
            const d = Phaser.Math.Distance.Squared(this.x, this.y, enemies[i].x, enemies[i].y);
            if (d < best) {
                best = d;
                target = enemies[i];
            }
        }

        const desiredX = Phaser.Math.Clamp((target.x - this.x) * 3.5, -260, 260);
        this.velocityX = Phaser.Math.Linear(this.velocityX, desiredX, this.turnRate);
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) + Math.PI / 2;
    }
}
