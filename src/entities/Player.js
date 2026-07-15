import Phaser from "phaser";
import { getShipById } from "../config/ShipCatalog";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        const selectedShipId =
            scene.saveManager?.getSelectedShip?.() ||
            scene.registry.get("selectedShip") ||
            "vanguard";

        const shipConfig = getShipById(selectedShipId);

        super(scene, x, y, shipConfig.texture || "player");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.shipConfig = shipConfig;

        this.setScale(0.12);
        if (this.shipConfig.tint && this.shipConfig.tint !== 0xffffff) {
            this.setTint(this.shipConfig.tint);
        }
        this.setDepth(10);
        this.body.setCollideWorldBounds(true);

        this.moveSpeed = 0.14 * (this.shipConfig.stats?.speed || 1);
        this.maxTilt = 10;
        this.isHit = false;

        this.isMobile =
            scene.sys.game.device.input.touch ||
            window.innerWidth <= 900;

        this.isDragging = false;

        this.lastPointerX = 0;
        this.lastPointerY = 0;

        this.targetX = x;
        this.targetY = y;

        this.touchSensitivity = 1.05;
        this.mobileLerp = 0.24;

        if (this.isMobile) {
            this.setupMobileControls();
        }
    }

    setupMobileControls() {
        this.scene.input.on("pointerdown", (pointer) => {
            this.isDragging = true;

            this.lastPointerX = pointer.worldX;
            this.lastPointerY = pointer.worldY;

            this.targetX = this.x;
            this.targetY = this.y;
        });

        this.scene.input.on("pointermove", (pointer) => {
            if (!this.isDragging || !pointer.isDown) return;

            const deltaX = pointer.worldX - this.lastPointerX;
            const deltaY = pointer.worldY - this.lastPointerY;

            this.targetX += deltaX * this.touchSensitivity;
            this.targetY += deltaY * this.touchSensitivity;

            this.targetX = Phaser.Math.Clamp(
                this.targetX,
                55,
                this.scene.scale.width - 55
            );

            this.targetY = Phaser.Math.Clamp(
                this.targetY,
                100,
                this.scene.scale.height - 75
            );

            this.lastPointerX = pointer.worldX;
            this.lastPointerY = pointer.worldY;
        });

        this.scene.input.on("pointerup", () => {
            this.isDragging = false;

            this.targetX = this.x;
            this.targetY = this.y;
        });

        this.scene.input.on("pointerout", () => {
            this.isDragging = false;

            this.targetX = this.x;
            this.targetY = this.y;
        });
    }

    update(pointer) {
        if (this.isHit) {
            this.angle = Phaser.Math.Linear(this.angle, 0, 0.2);
            return;
        }

        const oldX = this.x;

        if (this.isMobile) {
            this.updateMobileMovement();
        } else {
            this.updateDesktopMovement(pointer);
        }

        const deltaX = this.x - oldX;

        const targetTilt = Phaser.Math.Clamp(
            deltaX * 3,
            -this.maxTilt,
            this.maxTilt
        );

        this.angle = Phaser.Math.Linear(
            this.angle,
            targetTilt,
            0.18
        );

        this.setVisible(true);
        this.setAlpha(1);
    }

    updateMobileMovement() {
        this.targetX = Phaser.Math.Clamp(
            this.targetX,
            55,
            this.scene.scale.width - 55
        );

        this.targetY = Phaser.Math.Clamp(
            this.targetY,
            100,
            this.scene.scale.height - 75
        );

        this.x = Phaser.Math.Linear(
            this.x,
            this.targetX,
            this.mobileLerp
        );

        this.y = Phaser.Math.Linear(
            this.y,
            this.targetY,
            this.mobileLerp
        );
    }

    updateDesktopMovement(pointer) {
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

        this.x = Phaser.Math.Linear(
            this.x,
            targetX,
            this.moveSpeed
        );

        this.y = Phaser.Math.Linear(
            this.y,
            targetY,
            this.moveSpeed
        );
    }
}