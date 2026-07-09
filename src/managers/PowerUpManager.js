import Phaser from "phaser";
import PowerUp from "../entities/PowerUp";

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;

        this.weaponMode = "single";
        this.doubleLaserEndTime = 0;
        this.doubleLaserDuration = 25000;

        this.shieldHits = 0;
        this.shieldVisual = null;
    }

    update() {
        this.scene.powerUps.getChildren().forEach((power) => power.update());

        this.checkPickup();
        this.updateWeaponTimer();
        this.updateShieldVisual();
    }

    tryDropPowerUp(x, y) {
        const dropChance = Phaser.Math.Between(1, 100);

        if (dropChance <= 5) {
            this.scene.powerUps.add(new PowerUp(this.scene, x, y, "double"));
        } else if (dropChance <= 10) {
            this.scene.powerUps.add(new PowerUp(this.scene, x, y, "shield"));
        }
    }

    spawnReward(x, y, type) {
        const reward = new PowerUp(this.scene, x, y, type);
        this.scene.powerUps.add(reward);
    }

    spawnBossRewardPair(x, y) {
        this.spawnReward(x - 70, y, "shield");
        this.spawnReward(x + 70, y, "double");
    }

    checkPickup() {
        this.scene.powerUps.getChildren().forEach((power) => {
            if (!power.active || !this.scene.player?.active) return;

            const pickupRange =
                this.scene.upgradeManager?.getPickupRange?.() ?? 55;

            const distance = Phaser.Math.Distance.Between(
                power.x,
                power.y,
                this.scene.player.x,
                this.scene.player.y
            );

            if (distance < pickupRange) {
                const type = power.type;
                power.destroy();

                this.scene.soundManager?.sfx("powerup", 0.65);

                if (type === "shield") {
                    this.activateShield();
                } else if (type === "double") {
                    this.activateDoubleLaser();
                }
            }
        });
    }

    getWeaponMode() {
        return this.weaponMode;
    }

    activateDoubleLaser() {
        this.weaponMode = "double";

        const durationBonus =
            this.scene.upgradeManager?.getDoubleLaserDurationBonus?.() ?? 0;

        this.doubleLaserDuration = 25000 + durationBonus;
        this.doubleLaserEndTime = this.scene.time.now + this.doubleLaserDuration;

        const glow = this.scene.add.circle(
            this.scene.player.x,
            this.scene.player.y,
            45,
            0x38bdf8,
            0.25
        ).setDepth(8);

        this.scene.tweens.add({
            targets: glow,
            scale: 2,
            alpha: 0,
            duration: 400,
            ease: "Quad.easeOut",
            onComplete: () => glow.destroy()
        });
    }

    updateWeaponTimer() {
        if (this.weaponMode !== "double") return;

        const remainingMs = this.doubleLaserEndTime - this.scene.time.now;
        const percent = Phaser.Math.Clamp(
            remainingMs / this.doubleLaserDuration,
            0,
            1
        );

        if (remainingMs <= 0) {
            this.weaponMode = "single";
            this.scene.hud.hideWeapon();
            return;
        }

        this.scene.hud.showWeapon("DOUBLE LASER");
        this.scene.hud.updateWeaponBar(percent);
    }

    activateShield() {
        const upgradedShieldHits =
            this.scene.upgradeManager?.getShieldHits?.() ?? 3;

        this.shieldHits = upgradedShieldHits;

        if (this.shieldVisual) {
            this.shieldVisual.destroy(true);
            this.shieldVisual = null;
        }

        this.scene.soundManager?.sfx("powerup", 0.55);

        const shield = this.scene.add.container(
            this.scene.player.x,
            this.scene.player.y
        ).setDepth(26);

        const outerGlow = this.scene.add.circle(0, 0, 78, 0x22c55e, 0.08);
        const innerGlow = this.scene.add.circle(0, 0, 58, 0x38bdf8, 0.08);

        const outerRing = this.scene.add.circle(0, 0, 68, 0x22c55e, 0.035)
            .setStrokeStyle(4, 0x22c55e, 0.95);

        const innerRing = this.scene.add.circle(0, 0, 52, 0x38bdf8, 0.02)
            .setStrokeStyle(2, 0x7dd3fc, 0.75);

        const arc1 = this.scene.add.arc(0, 0, 72, 18, 115, false, 0x22c55e, 0)
            .setStrokeStyle(5, 0x22c55e, 0.95);

        const arc2 = this.scene.add.arc(0, 0, 72, 198, 295, false, 0x38bdf8, 0)
            .setStrokeStyle(5, 0x38bdf8, 0.85);

        const arc3 = this.scene.add.arc(0, 0, 61, 290, 350, false, 0xa7f3d0, 0)
            .setStrokeStyle(3, 0xa7f3d0, 0.75);

        const corePulse = this.scene.add.circle(0, 0, 42, 0x22c55e, 0.05);

        shield.add([
            outerGlow,
            innerGlow,
            outerRing,
            innerRing,
            arc1,
            arc2,
            arc3,
            corePulse
        ]);

        shield.outerRing = outerRing;
        shield.innerRing = innerRing;
        shield.arc1 = arc1;
        shield.arc2 = arc2;
        shield.arc3 = arc3;
        shield.corePulse = corePulse;

        this.shieldVisual = shield;

        this.scene.tweens.add({
            targets: shield,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.scene.tweens.add({
            targets: corePulse,
            scaleX: 1.35,
            scaleY: 1.35,
            alpha: 0.12,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.scene.cameras.main.flash(120, 34, 197, 94);
    }

    hasShield() {
        return this.shieldHits > 0;
    }

    updateShieldVisual() {
        if (!this.hasShield() || !this.shieldVisual || !this.scene.player?.active) return;

        this.shieldVisual.x = this.scene.player.x;
        this.shieldVisual.y = this.scene.player.y;

        this.shieldVisual.arc1.angle += 2.4;
        this.shieldVisual.arc2.angle -= 2.1;
        this.shieldVisual.arc3.angle += 3.1;

        const alpha = Phaser.Math.Clamp(0.18 + this.shieldHits * 0.07, 0.2, 0.55);

        this.shieldVisual.outerRing.setStrokeStyle(4, 0x22c55e, alpha);
        this.shieldVisual.innerRing.setStrokeStyle(2, 0x7dd3fc, alpha * 0.85);
    }

    breakShield() {
        if (this.shieldHits <= 0) return;

        this.shieldHits -= 1;

        this.scene.soundManager?.sfx("hit", 0.45);

        this.scene.playerInvincible = true;
        this.scene.cameras.main.shake(80, 0.004);

        const burst = this.scene.add.circle(
            this.scene.player.x,
            this.scene.player.y,
            60,
            0x22c55e,
            0.35
        ).setStrokeStyle(5, 0x7dd3fc, 0.85).setDepth(30);

        this.scene.tweens.add({
            targets: burst,
            scale: 2.2,
            alpha: 0,
            duration: 320,
            ease: "Quad.easeOut",
            onComplete: () => burst.destroy()
        });

        if (this.shieldHits <= 0 && this.shieldVisual) {
            this.scene.tweens.add({
                targets: this.shieldVisual,
                scaleX: 1.6,
                scaleY: 1.6,
                alpha: 0,
                duration: 250,
                ease: "Quad.easeOut",
                onComplete: () => {
                    if (this.shieldVisual) {
                        this.shieldVisual.destroy(true);
                        this.shieldVisual = null;
                    }
                }
            });
        }

        this.scene.time.delayedCall(450, () => {
            this.scene.playerInvincible = false;
        });
    }
}
