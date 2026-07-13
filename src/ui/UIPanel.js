import Phaser from "phaser";

export default class UIPanel extends Phaser.GameObjects.Container {
    constructor(scene, options = {}) {
        const centerX = scene.scale.width / 2;
        const centerY = scene.scale.height / 2;

        super(scene, centerX, centerY);
        scene.add.existing(this);

        const width = options.width ?? 560;
        const height = options.height ?? 500;

        this.overlay = scene.add.rectangle(
            -centerX,
            -centerY,
            scene.scale.width,
            scene.scale.height,
            0x020617,
            options.overlayAlpha ?? 0.82
        ).setOrigin(0);

        this.overlay.setInteractive();

        this.shadow = scene.add.rectangle(
            10,
            12,
            width,
            height,
            0x000000,
            0.45
        );

        this.glow = scene.add.rectangle(
            0,
            0,
            width + 10,
            height + 10,
            0x000000,
            0
        ).setStrokeStyle(2, 0x38bdf8, 0.28);

        this.panel = scene.add.rectangle(
            0,
            0,
            width,
            height,
            options.panelColor ?? 0x08111f,
            0.98
        ).setStrokeStyle(3, options.borderColor ?? 0x38bdf8, 1);

        this.add([
            this.overlay,
            this.shadow,
            this.glow,
            this.panel
        ]);

        this.setDepth(options.depth ?? 2000);
    }

    addContent(gameObject) {
        this.add(gameObject);
        return gameObject;
    }
}