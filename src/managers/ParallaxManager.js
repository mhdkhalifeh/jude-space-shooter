import Phaser from "phaser";

export default class ParallaxManager {
    constructor(scene) {
        this.scene = scene;
        this.stars = scene.add.group();
        this.dust = scene.add.group();

        this.createStars();
        this.createDust();
    }

    createStars() {
        const { width, height } = this.scene.scale;

        for (let i = 0; i < 80; i++) {
            const star = this.scene.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(0.8, 2),
                0xffffff,
                Phaser.Math.FloatBetween(0.25, 0.75)
            ).setDepth(2);

            star.speed = Phaser.Math.FloatBetween(0.4, 1.4);
            this.stars.add(star);
        }
    }

    createDust() {
        const { width, height } = this.scene.scale;

        for (let i = 0; i < 35; i++) {
            const dust = this.scene.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(1.5, 4),
                0x22c55e,
                Phaser.Math.FloatBetween(0.05, 0.16)
            ).setDepth(3);

            dust.speed = Phaser.Math.FloatBetween(1, 2.6);
            this.dust.add(dust);
        }
    }

    update() {
        const { width, height } = this.scene.scale;

        this.stars.getChildren().forEach((star) => {
            star.y += star.speed;

            if (star.y > height + 8) {
                star.y = -8;
                star.x = Phaser.Math.Between(0, width);
            }
        });

        this.dust.getChildren().forEach((dust) => {
            dust.y += dust.speed;

            if (dust.y > height + 12) {
                dust.y = -12;
                dust.x = Phaser.Math.Between(0, width);
            }
        });
    }
}