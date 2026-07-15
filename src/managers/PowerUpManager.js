import Phaser from "phaser";
import PowerUp from "../entities/PowerUp";

const TIMED_POWERUPS = {
    double: { duration: 25000, label: "DOUBLE LASER" },
    spread: { duration: 18000, label: "SPREAD SHOT" },
    railgun: { duration: 14000, label: "RAILGUN" },
    homing: { duration: 16000, label: "HOMING MISSILES" },
    overdrive: { duration: 12000, label: "OVERDRIVE" },
    damage: { duration: 15000, label: "DAMAGE BOOST" }
};

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.weaponMode = "single";
        this.effectEndTimes = {};
        this.effectDurations = {};
        this.shieldHits = 0;
        this.shieldVisual = null;
        this.magnetEndTime = 0;
    }

    update() {
        this.scene.powerUps.getChildren().forEach((power) => power.update());
        this.checkPickup();
        this.updateTimedEffects();
        this.updateShieldVisual();
    }

    tryDropPowerUp(x, y) {
        const roll = Phaser.Math.Between(1, 1000);
        let type = null;

        if (roll <= 38) type = "double";
        else if (roll <= 70) type = "shield";
        else if (roll <= 88) type = "spread";
        else if (roll <= 100) type = "overdrive";
        else if (roll <= 110) type = "damage";
        else if (roll <= 118) type = "homing";
        else if (roll <= 124) type = "railgun";
        else if (roll <= 132) type = "emp";
        else if (roll <= 140) type = "repair";

        if (type) this.spawnReward(x, y, type);
    }

    spawnReward(x, y, type) {
        this.scene.powerUps.add(new PowerUp(this.scene, x, y, type));
    }

    spawnBossRewardPair(x, y) {
        this.spawnReward(x - 80, y, "shield");
        this.spawnReward(x + 80, y, Phaser.Utils.Array.GetRandom(["spread", "homing", "railgun", "overdrive"]));
    }

    checkPickup() {
        this.scene.powerUps.getChildren().forEach((power) => {
            if (!power.active || !this.scene.player?.active) return;

            const baseRange = this.scene.upgradeManager?.getPickupRange?.() ?? 55;
            const magnetBonus = this.scene.time.now < this.magnetEndTime ? 140 : 0;
            const distance = Phaser.Math.Distance.Between(power.x, power.y, this.scene.player.x, this.scene.player.y);

            if (magnetBonus > 0 && distance < baseRange + magnetBonus) {
                power.x = Phaser.Math.Linear(power.x, this.scene.player.x, 0.14);
                power.y = Phaser.Math.Linear(power.y, this.scene.player.y, 0.14);
            }

            if (distance >= baseRange) return;

            const type = power.type;
            power.destroy();
            this.scene.soundManager?.sfx("powerup", 0.65);
            this.scene.saveManager?.addPowerUp(type);
            this.activate(type);
            this.scene.achievementManager?.check();
        });
    }

    activate(type) {
        if (TIMED_POWERUPS[type]) {
            this.activateTimed(type, TIMED_POWERUPS[type].duration);
            return;
        }

        if (type === "shield") this.activateShield();
        if (type === "emp") this.activateEMP();
        if (type === "repair") this.activateRepair();
        if (type === "magnet") this.magnetEndTime = this.scene.time.now + 18000;
    }

    activateTimed(type, duration) {
        const durationBonus = type === "double"
            ? (this.scene.upgradeManager?.getDoubleLaserDurationBonus?.() ?? 0)
            : 0;

        const finalDuration = duration + durationBonus;
        this.weaponMode = ["double", "spread", "railgun", "homing"].includes(type) ? type : this.weaponMode;
        this.effectDurations[type] = finalDuration;
        this.effectEndTimes[type] = this.scene.time.now + finalDuration;

        const color = {
            double: 0x38bdf8,
            spread: 0xa78bfa,
            railgun: 0xf97316,
            homing: 0xfacc15,
            overdrive: 0xef4444,
            damage: 0xfb7185
        }[type] || 0x38bdf8;

        const glow = this.scene.add.circle(this.scene.player.x, this.scene.player.y, 45, color, 0.25).setDepth(8);
        this.scene.tweens.add({ targets: glow, scale: 2, alpha: 0, duration: 400, ease: "Quad.easeOut", onComplete: () => glow.destroy() });
    }

    updateTimedEffects() {
        const now = this.scene.time.now;

        if (["double", "spread", "railgun", "homing"].includes(this.weaponMode)) {
            const end = this.effectEndTimes[this.weaponMode] || 0;
            const duration = this.effectDurations[this.weaponMode] || 1;
            const remaining = end - now;

            if (remaining <= 0) {
                this.weaponMode = "single";
                this.scene.hud.hideWeapon();
            } else {
                this.scene.hud.showWeapon(TIMED_POWERUPS[this.weaponMode].label);
                this.scene.hud.updateWeaponBar(Phaser.Math.Clamp(remaining / duration, 0, 1));
            }
        }
    }

    getWeaponMode() {
        return this.weaponMode;
    }

    isOverdriveActive() {
        return this.scene.time.now < (this.effectEndTimes.overdrive || 0);
    }

    getDamageMultiplier() {
        return this.scene.time.now < (this.effectEndTimes.damage || 0) ? 2 : 1;
    }

    getFireRateMultiplier() {
        return this.isOverdriveActive() ? 0.52 : 1;
    }

    activateEMP() {
        const until = this.scene.time.now + 4200;
        this.scene.enemies.getChildren().forEach((enemy) => {
            if (enemy.active) enemy.empUntil = Math.max(enemy.empUntil || 0, until);
        });

        const ring = this.scene.add.circle(this.scene.player.x, this.scene.player.y, 30, 0x22d3ee, 0.12)
            .setStrokeStyle(5, 0x67e8f9, 0.95).setDepth(45);
        this.scene.tweens.add({ targets: ring, radius: Math.max(this.scene.scale.width, this.scene.scale.height), alpha: 0, duration: 650, onComplete: () => ring.destroy() });
        this.scene.cameras.main.flash(180, 40, 210, 255);
    }

    activateRepair() {
        const maxHp = this.scene.maxPlayerHP || 3;
        const oldHp = this.scene.playerHP;
        this.scene.playerHP = Math.min(maxHp, this.scene.playerHP + 1);
        this.scene.hud.updateHP(this.scene.playerHP);

        if (this.scene.playerHP > oldHp) {
            const text = this.scene.add.text(this.scene.player.x, this.scene.player.y - 65, "+1 HULL", {
                fontFamily: "Oxanium, sans-serif", fontSize: "20px", color: "#86efac", fontStyle: "bold", stroke: "#020617", strokeThickness: 4
            }).setOrigin(0.5).setDepth(50);
            this.scene.tweens.add({ targets: text, y: text.y - 45, alpha: 0, duration: 900, onComplete: () => text.destroy() });
        }
    }

    activateShield() {
        this.shieldHits = this.scene.upgradeManager?.getShieldHits?.() ?? 3;
        this.shieldVisual?.destroy(true);

        const shield = this.scene.add.container(this.scene.player.x, this.scene.player.y).setDepth(26);
        const outerGlow = this.scene.add.circle(0, 0, 78, 0x22c55e, 0.08);
        const outerRing = this.scene.add.circle(0, 0, 68, 0x22c55e, 0.035).setStrokeStyle(4, 0x22c55e, 0.95);
        const innerRing = this.scene.add.circle(0, 0, 52, 0x38bdf8, 0.02).setStrokeStyle(2, 0x7dd3fc, 0.75);
        const arc1 = this.scene.add.arc(0, 0, 72, 18, 115, false, 0x22c55e, 0).setStrokeStyle(5, 0x22c55e, 0.95);
        const arc2 = this.scene.add.arc(0, 0, 72, 198, 295, false, 0x38bdf8, 0).setStrokeStyle(5, 0x38bdf8, 0.85);
        const corePulse = this.scene.add.circle(0, 0, 42, 0x22c55e, 0.05);
        shield.add([outerGlow, outerRing, innerRing, arc1, arc2, corePulse]);
        Object.assign(shield, { outerRing, innerRing, arc1, arc2, corePulse });
        this.shieldVisual = shield;

        this.scene.tweens.add({ targets: shield, scaleX: 1.08, scaleY: 1.08, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.scene.tweens.add({ targets: corePulse, scaleX: 1.35, scaleY: 1.35, alpha: 0.12, duration: 500, yoyo: true, repeat: -1 });
        this.scene.cameras.main.flash(120, 34, 197, 94);
    }

    hasShield() {
        return this.shieldHits > 0;
    }

    updateShieldVisual() {
        if (!this.hasShield() || !this.shieldVisual || !this.scene.player?.active) return;
        this.shieldVisual.setPosition(this.scene.player.x, this.scene.player.y);
        this.shieldVisual.arc1.angle += 2.4;
        this.shieldVisual.arc2.angle -= 2.1;
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

        const burst = this.scene.add.circle(this.scene.player.x, this.scene.player.y, 60, 0x22c55e, 0.35)
            .setStrokeStyle(5, 0x7dd3fc, 0.85).setDepth(30);
        this.scene.tweens.add({ targets: burst, scale: 2.2, alpha: 0, duration: 320, ease: "Quad.easeOut", onComplete: () => burst.destroy() });

        if (this.shieldHits <= 0 && this.shieldVisual) {
            const visual = this.shieldVisual;
            this.shieldVisual = null;
            this.scene.tweens.add({ targets: visual, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 250, onComplete: () => visual.destroy(true) });
        }

        this.scene.time.delayedCall(450, () => { this.scene.playerInvincible = false; });
    }
}
