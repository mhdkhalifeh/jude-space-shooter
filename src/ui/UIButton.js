import Phaser from "phaser";

export default class UIButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, callback, options = {}) {
        super(scene, x, y);
        scene.add.existing(this);

        this.callback = callback;
        this.enabled = true;
        this.buttonWidth = options.width ?? 320;
        this.buttonHeight = options.height ?? 64;
        this.baseColor = options.color ?? 0x0f172a;
        this.hoverColor = options.hoverColor ?? 0x1e293b;
        this.borderColor = options.borderColor ?? 0x38bdf8;
        this.hoverBorderColor = options.hoverBorderColor ?? 0x7dd3fc;

        this.background = scene.add.rectangle(
            0, 0,
            this.buttonWidth,
            this.buttonHeight,
            this.baseColor,
            0.96
        ).setStrokeStyle(2, this.borderColor, 1);

        this.label = scene.add.text(0, 0, text, {
            fontSize: options.fontSize ?? "27px",
            fontStyle: "bold",
            color: options.textColor ?? "#FFFFFF",
            align: "center",
            stroke: "#020617",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add([this.background, this.label]);

        this.setSize(this.buttonWidth, this.buttonHeight);
        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -this.buttonWidth / 2,
                -this.buttonHeight / 2,
                this.buttonWidth,
                this.buttonHeight
            ),
            Phaser.Geom.Rectangle.Contains
        );

        this.input.cursor = "pointer";

        this.on("pointerover", () => {
            if (!this.enabled) return;
            this.background.setFillStyle(this.hoverColor, 1);
            this.background.setStrokeStyle(3, this.hoverBorderColor, 1);
            this.setScale(1.04);
        });

        this.on("pointerout", () => {
            if (!this.enabled) return;
            this.background.setFillStyle(this.baseColor, 0.96);
            this.background.setStrokeStyle(2, this.borderColor, 1);
            this.setScale(1);
        });

        this.on("pointerdown", () => {
            if (!this.enabled) return;
            this.setScale(0.97);
            scene.soundManager?.sfx?.("button", 0.45);
        });

        this.on("pointerup", () => {
            if (!this.enabled) return;
            this.setScale(1.04);
            if (typeof this.callback === "function") {
                this.callback();
            }
        });
    }

    setEnabled(value) {
        this.enabled = value;

        if (value) {
            this.setAlpha(1);
            this.setInteractive();
            this.input.cursor = "pointer";
        } else {
            this.setAlpha(0.45);
            this.disableInteractive();
        }

        return this;
    }

    setText(text) {
        this.label.setText(text);
        return this;
    }
}