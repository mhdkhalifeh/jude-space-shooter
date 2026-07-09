import Phaser from "phaser";

export default class SplashScene extends Phaser.Scene {
    constructor() {
        super("SplashScene");
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.cameras.main.setBackgroundColor("#020617");

        const title = this.add.text(w / 2, h / 2 - 35, "JUDE GAME STUDIO", {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const presents = this.add.text(w / 2, h / 2 + 35, "presents", {
            fontSize: "24px",
            color: "#94a3b8"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [title, presents],
            alpha: 0,
            duration: 700,
            delay: 1300,
            onComplete: () => {
                this.scene.start("MenuScene");
            }
        });
    }
}