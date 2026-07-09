import Phaser from "phaser";
import BaseBoss from "./BaseBoss";
import { BossTypes } from "../config/BossTypes";
import EnemyBullet from "../entities/EnemyBullet";

export default class BossOmega extends BaseBoss {
    constructor(scene, x, y) {
        const stats = BossTypes.omega;

        super(scene, x, y, stats);

        this.stats = stats;

        this.isEntering = true;
        this.isCoolingDown = false;
        this.lastPhase = 1;

        this.baseY = stats.entryY;
        this.moveTime = 0;
        this.moveDirection = 1;

        this.lastShotTime = 0;
        this.lastMineTime = 0;
        this.lastDashTime = 0;

        this.attackStartTime = 0;
        this.cooldownUntil = 0;

        this.reward75 = false;
        this.reward50 = false;
        this.reward25 = false;

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
    }

    update() {
        if (this.isDead) return;

        if (this.isEntering) {
            this.y = Phaser.Math.Linear(this.y, this.stats.entryY, 0.016);

            if (Math.abs(this.y - this.stats.entryY) < 2) {
                this.y = this.stats.entryY;
                this.isEntering = false;
                this.attackStartTime = this.scene.time.now + 1200;
            }

            return;
        }

        this.updatePhase();
        this.updateMovement();
        this.updateAttackCycle();
    }

    updatePhase() {
        const hpPercent = this.hp / this.maxHp;

        if (hpPercent <= 0.75 && !this.reward75) {
            this.reward75 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= 0.5 && !this.reward50) {
            this.reward50 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= 0.25 && !this.reward25) {
            this.reward25 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= this.stats.phase3HP) {
            this.phase = 3;
        } else if (hpPercent <= this.stats.phase2HP) {
            this.phase = 2;
        } else {
            this.phase = 1;
        }

        if (this.phase !== this.lastPhase) {
            this.onPhaseChanged();
            this.lastPhase = this.phase;
        }
    }

    onPhaseChanged() {
        this.scene.cameras.main.flash(260, 168, 85, 247);
        this.scene.cameras.main.shake(420, 0.01);

        this.scene.effects.createExplosion(this.x, this.y + 70);
        this.scene.effects.createExplosion(this.x - 120, this.y + 110);
        this.scene.effects.createExplosion(this.x + 120, this.y + 110);

        this.isCoolingDown = true;
        this.cooldownUntil = this.scene.time.now + 1700;
        this.attackStartTime = this.cooldownUntil;
    }

    updateMovement() {
        const minX = 250;
        const maxX = this.scene.scale.width - 250;

        this.moveTime += 0.018;

        if (this.phase === 3 && this.scene.time.now > this.lastDashTime + this.stats.dashCooldown) {
            this.lastDashTime = this.scene.time.now;
            this.moveDirection *= -1;

            this.scene.tweens.add({
                targets: this,
                x: this.moveDirection > 0 ? maxX : minX,
                duration: 520,
                ease: "Cubic.easeInOut"
            });

            return;
        }

        this.x += this.moveDirection * (this.stats.moveSpeed + this.phase * 0.35);
        this.y = this.baseY + Math.sin(this.moveTime) * (this.stats.moveAmplitude + this.phase * 3);

        if (this.x <= minX) {
            this.x = minX;
            this.moveDirection = 1;
        }

        if (this.x >= maxX) {
            this.x = maxX;
            this.moveDirection = -1;
        }
    }

    updateAttackCycle() {
        const now = this.scene.time.now;

        if (this.isCoolingDown) {
            if (now >= this.cooldownUntil) {
                this.isCoolingDown = false;
                this.attackStartTime = now;
            }
            return;
        }

        const attackDuration = this.phase === 3 ? 3600 : 3000;
        const restDuration = this.phase === 3 ? 1200 : 1700;

        if (now - this.attackStartTime > attackDuration) {
            this.isCoolingDown = true;
            this.cooldownUntil = now + restDuration;
            return;
        }

        this.updateShooting();

        if (this.phase >= 2) {
            this.updateMineDrops();
        }
    }

    updateShooting() {
        const fireDelay = Math.max(520, this.stats.fireDelay - this.phase * 110);

        if (this.scene.time.now <= this.lastShotTime + fireDelay) return;

        if (this.phase === 1) {
            this.fireTwinPlasma();
        }

        if (this.phase === 2) {
            this.fireTriplePlasma();
        }

        if (this.phase === 3) {
            this.fireOmegaSpread();
        }

        this.lastShotTime = this.scene.time.now;
    }

    updateMineDrops() {
        if (!this.scene.mineManager?.spawnMine) return;
        if (this.scene.time.now <= this.lastMineTime + this.stats.mineDelay) return;

        this.lastMineTime = this.scene.time.now;

        this.scene.mineManager.spawnMine(this.x - 90, this.y + 95);
        this.scene.mineManager.spawnMine(this.x + 90, this.y + 95);

        if (this.phase === 3) {
            this.scene.mineManager.spawnMine(this.x, this.y + 115);
        }
    }

    fireTwinPlasma() {
        this.fireAtPlayer(this.x - 80, this.y + 115, 0.085);
        this.fireAtPlayer(this.x + 80, this.y + 115, 0.085);
    }

    fireTriplePlasma() {
        this.fireAtPlayer(this.x - 110, this.y + 120, 0.078);
        this.fireAtPlayer(this.x, this.y + 135, 0.085);
        this.fireAtPlayer(this.x + 110, this.y + 120, 0.078);
    }

    fireOmegaSpread() {
        this.fireSpread(this.x, this.y + 130, 5, 75, 0.065);
        this.fireAtPlayer(this.x - 135, this.y + 105, 0.075);
        this.fireAtPlayer(this.x + 135, this.y + 105, 0.075);
    }

    fireAtPlayer(x, y, scale = 0.08) {
        if (!this.scene.player?.active) return;

        const bullet = new EnemyBullet(
            this.scene,
            x,
            y,
            this.scene.player.x,
            this.scene.player.y
        );

        bullet.setScale(scale);
        this.scene.enemyBullets.add(bullet);
    }

    fireSpread(x, y, count = 5, spacing = 75, scale = 0.07) {
        const start = -Math.floor(count / 2);

        for (let i = 0; i < count; i++) {
            const offset = (start + i) * spacing;

            const bullet = new EnemyBullet(
                this.scene,
                x + offset,
                y,
                x + offset,
                this.scene.scale.height + 200
            );

            bullet.setScale(scale);
            this.scene.enemyBullets.add(bullet);
        }
    }

    dropBossRewardPair() {
        const dropY = this.y + 125;
        const dropX = Phaser.Math.Clamp(this.x, 240, this.scene.scale.width - 240);

        this.scene.effects.createExplosion(dropX, dropY);
        this.scene.powerUpManager.spawnBossRewardPair(dropX, dropY);
    }

    takeDamage(amount = 1) {
        if (this.isDead || this.isEntering) return false;

        this.hp = Math.max(0, this.hp - amount);

        this.setTintFill(0xffffff);

        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 35,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (this.active) {
                    this.clearTint();
                    this.setAlpha(1);
                }
            }
        });

        if (this.hp <= 0) {
            this.isDead = true;
            return true;
        }

        return false;
    }
}