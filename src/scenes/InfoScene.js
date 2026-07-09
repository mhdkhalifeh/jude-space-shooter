import Phaser from "phaser";

export default class InfoScene extends Phaser.Scene {
    constructor() {
        super("InfoScene");
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.cameras.main.setBackgroundColor("#020617");

        if (this.textures.exists("background_space")) {
            this.add.image(w / 2, h / 2, "background_space")
                .setDisplaySize(w, h)
                .setAlpha(0.45);
        }

        this.add.rectangle(w / 2, h / 2, w, h, 0x020617, 0.72);

        this.add.text(w / 2, 70, "JUDE SPACE SHOOTER", {
            fontSize: "48px",
            color: "#38BDF8",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 7
        }).setOrigin(0.5);

        this.add.text(w / 2, 135, "A JUDE PLAY Original Game", {
            fontSize: "26px",
            color: "#FACC15",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(w / 2, 310,
            "Fight through endless alien fleets.\n" +
            "Defeat massive bosses.\n" +
            "Survive asteroid fields and nebula sectors.\n" +
            "Upgrade your ship and weapons.\n\n" +
            "Version: Beta 1.0\n\n" +
            "Developed by JUDE Game Studio\n" +
            "Published by JUDE PLAY\n\n" +
            "© 2026 JUDE PLAY. All Rights Reserved.",
            {
                fontSize: "24px",
                color: "#CBD5E1",
                align: "center",
                lineSpacing: 9,
                stroke: "#000",
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        const back = this.add.text(w / 2, h - 75, "BACK TO MENU", {
            fontSize: "34px",
            color: "#22C55E",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 6
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        back.on("pointerover", () => {
            back.setScale(1.08);
            back.setColor("#FACC15");
        });

        back.on("pointerout", () => {
            back.setScale(1);
            back.setColor("#22C55E");
        });

        back.on("pointerdown", () => {
            this.scene.start("MenuScene");
        });

        this.input.keyboard.on("keydown-ESC", () => {
            this.scene.start("MenuScene");
        });
    }
}