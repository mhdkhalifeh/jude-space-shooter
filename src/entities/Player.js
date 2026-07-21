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

// بدون Tint أو تأثيرات لونية
this.clearTint();
this.setAlpha(1);

this.setDepth(10);
this.body.setCollideWorldBounds(true);

        this.moveSpeed =
            0.14 *
            (this.shipConfig.stats?.speed || 1);

        this.maxTilt = 10;
        this.isHit = false;

        this.isMobile =
            scene.sys.game.device.input.touch ||
            window.matchMedia("(pointer: coarse)").matches ||
            window.innerWidth <= 900;

        this.isDragging = false;

        this.lastPointerX = 0;
        this.lastPointerY = 0;

        this.targetX = x;
        this.targetY = y;

        this.touchSensitivity = 1.08;

        this.mobileLerpMin = 0.16;
        this.mobileLerpMax = 0.34;
        this.currentMobileLerp = 0.22;

        this.lastTouchSpeed = 0;

        this.onPointerDown = null;
        this.onPointerMove = null;
        this.onPointerUp = null;
        this.onPointerOut = null;

        if (this.isMobile) {
            this.setupMobileControls();
        }

        this.scene.events.once(
            "shutdown",
            this.destroyMobileControls,
            this
        );
    }

    setupMobileControls() {
        this.onPointerDown = (pointer) => {
            if (this.scene.isPausedByMenu) return;

            this.isDragging = true;

            this.lastPointerX = pointer.worldX;
            this.lastPointerY = pointer.worldY;

            this.targetX = this.x;
            this.targetY = this.y;

            this.lastTouchSpeed = 0;
        };

        this.onPointerMove = (pointer) => {
            if (
                !this.isDragging ||
                !pointer.isDown ||
                this.scene.isPausedByMenu
            ) {
                return;
            }

            const deltaX =
                pointer.worldX -
                this.lastPointerX;

            const deltaY =
                pointer.worldY -
                this.lastPointerY;

            const movementDistance =
                Math.sqrt(
                    deltaX * deltaX +
                    deltaY * deltaY
                );

            this.lastTouchSpeed =
                Phaser.Math.Clamp(
                    movementDistance / 45,
                    0,
                    1
                );

            this.currentMobileLerp =
                Phaser.Math.Linear(
                    this.mobileLerpMin,
                    this.mobileLerpMax,
                    this.lastTouchSpeed
                );

            this.targetX +=
                deltaX *
                this.touchSensitivity;

            this.targetY +=
                deltaY *
                this.touchSensitivity;

            this.clampMobileTarget();

            this.lastPointerX =
                pointer.worldX;

            this.lastPointerY =
                pointer.worldY;
        };

        this.onPointerUp = () => {
            this.stopMobileDrag();
        };

        this.onPointerOut = () => {
            this.stopMobileDrag();
        };

        this.scene.input.on(
            "pointerdown",
            this.onPointerDown
        );

        this.scene.input.on(
            "pointermove",
            this.onPointerMove
        );

        this.scene.input.on(
            "pointerup",
            this.onPointerUp
        );

        this.scene.input.on(
            "pointerout",
            this.onPointerOut
        );
    }

    stopMobileDrag() {
        this.isDragging = false;

        this.targetX = this.x;
        this.targetY = this.y;

        this.currentMobileLerp =
            this.mobileLerpMin;

        this.lastTouchSpeed = 0;
    }

    clampMobileTarget() {
        this.targetX =
            Phaser.Math.Clamp(
                this.targetX,
                55,
                this.scene.scale.width - 55
            );

        this.targetY =
            Phaser.Math.Clamp(
                this.targetY,
                105,
                this.scene.scale.height - 82
            );
    }

    update(pointer) {
        if (this.isHit) {
            this.angle =
                Phaser.Math.Linear(
                    this.angle,
                    0,
                    0.2
                );

            return;
        }

        const oldX = this.x;

        if (this.isMobile) {
            this.updateMobileMovement();
        } else {
            this.updateDesktopMovement(pointer);
        }

        const deltaX =
            this.x - oldX;

        const targetTilt =
            Phaser.Math.Clamp(
                deltaX * 3,
                -this.maxTilt,
                this.maxTilt
            );

        this.angle =
            Phaser.Math.Linear(
                this.angle,
                targetTilt,
                0.18
            );

        this.setVisible(true);
        this.setAlpha(1);
    }

    updateMobileMovement() {
        this.clampMobileTarget();

        const shipSpeedMultiplier =
            this.shipConfig.stats?.speed || 1;

        const lerp =
            Phaser.Math.Clamp(
                this.currentMobileLerp *
                    shipSpeedMultiplier,
                this.mobileLerpMin,
                0.42
            );

        this.x =
            Phaser.Math.Linear(
                this.x,
                this.targetX,
                lerp
            );

        this.y =
            Phaser.Math.Linear(
                this.y,
                this.targetY,
                lerp
            );

        if (!this.isDragging) {
            this.currentMobileLerp =
                Phaser.Math.Linear(
                    this.currentMobileLerp,
                    this.mobileLerpMin,
                    0.12
                );
        }
    }

    updateDesktopMovement(pointer) {
        const targetX =
            Phaser.Math.Clamp(
                pointer.worldX,
                80,
                this.scene.scale.width - 80
            );

        const targetY =
            Phaser.Math.Clamp(
                pointer.worldY,
                100,
                this.scene.scale.height - 80
            );

        this.x =
            Phaser.Math.Linear(
                this.x,
                targetX,
                this.moveSpeed
            );

        this.y =
            Phaser.Math.Linear(
                this.y,
                targetY,
                this.moveSpeed
            );
    }

    destroyMobileControls() {
        if (!this.scene?.input) return;

        if (this.onPointerDown) {
            this.scene.input.off(
                "pointerdown",
                this.onPointerDown
            );
        }

        if (this.onPointerMove) {
            this.scene.input.off(
                "pointermove",
                this.onPointerMove
            );
        }

        if (this.onPointerUp) {
            this.scene.input.off(
                "pointerup",
                this.onPointerUp
            );
        }

        if (this.onPointerOut) {
            this.scene.input.off(
                "pointerout",
                this.onPointerOut
            );
        }
    }
}