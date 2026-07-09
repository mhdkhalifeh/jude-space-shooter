import Phaser from "phaser";

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "asteroid");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.kind = Phaser.Math.RND.pick(["small", "medium", "large"]);

        const configs = {
            small: {
                hp: 2,
                speed: Phaser.Math.Between(210, 300),
                scale: Phaser.Math.FloatBetween(0.07, 0.10),
                score: 75,
                damageRadius: 34
            },
            medium: {
                hp: 4,
                speed: Phaser.Math.Between(150, 230),
                scale: Phaser.Math.FloatBetween(0.11, 0.15),
                score: 140,
                damageRadius: 48
            },
            large: {
                hp: 7,
                speed: Phaser.Math.Between(95, 160),
                scale: Phaser.Math.FloatBetween(0.17, 0.22),
                score: 260,
                damageRadius: 66
            }
        };

        const config = configs[this.kind];

        this.hp = config.hp;
        this.maxHp = config.hp;
        this.speed = config.speed;
        this.scoreValue = config.score;
        this.damageRadius = config.damageRadius;

        this.rotationSpeed = Phaser.Math.FloatBetween(-2.2, 2.2);
        this.drift = Phaser.Math.Between(-55, 55);

        this.setDepth(7);
        this.setScale(config.scale);
    }

    takeDamage(amount = 1) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    update() {
        const delta = this.scene.game.loop.delta / 1000;

        this.y += this.speed * delta;
        this.x += this.drift * delta;
        this.rotation += this.rotationSpeed * delta;

        if (this.x < -120 || this.x > this.scene.scale.width + 120) {
            this.destroy();
            return;
        }

        if (this.y > this.scene.scale.height + 140) {
            this.destroy();
        }
    }
}