import Phaser from "phaser";
import BaseBoss from "./BaseBoss";
import { BossTypes } from "../config/BossTypes";
import EnemyBullet from "../entities/EnemyBullet";

export default class BossAlpha extends BaseBoss {
    constructor(scene, x, y) {
        const stats = BossTypes.alpha;

        super(scene, x, y, stats);

        this.stats = stats;
        this.lastPhase = 1;
        this.isEntering = true;
        this.isCoolingDown = false;

        this.reward80 = false;
        this.reward60 = false;
        this.reward40 = false;
        this.reward20 = false;

        this.attackStartTime = 0;
        this.cooldownUntil = 0;
        this.lastShotTime = 0;

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        this.baseY = stats.entryY;
        this.moveDirection = 1;
        this.moveTime = 0;
    }

    update() {
        if (this.isDead) return;

        if (this.isEntering) {
            this.y = Phaser.Math.Linear(this.y, this.stats.entryY, 0.018);

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

        if (hpPercent <= 0.8 && !this.reward80) {
            this.reward80 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= 0.6 && !this.reward60) {
            this.reward60 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= 0.4 && !this.reward40) {
            this.reward40 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= 0.2 && !this.reward20) {
            this.reward20 = true;
            this.dropBossRewardPair();
        }

        if (hpPercent <= 0.35) {
            this.phase = 3;
        } else if (hpPercent <= 0.7) {
            this.phase = 2;
        } else {
            this.phase = 1;
        }

        if (this.phase !== this.lastPhase) {
            this.onPhaseChanged();
            this.lastPhase = this.phase;
        }
    }

    updateMovement() {
        const minX = 280;
        const maxX = this.scene.scale.width - 280;

        this.moveTime += 0.015;
        this.x += this.moveDirection * (0.7 + this.phase * 0.2);
        this.y = this.baseY + Math.sin(this.moveTime) * (7 + this.phase * 2);

        if (this.x <= minX) {
            this.x = minX;
            this.moveDirection = 1;
        }

        if (this.x >= maxX) {
            this.x = maxX;
            this.moveDirection = -1;
        }
    }

    onPhaseChanged() {
        this.scene.cameras.main.flash(220, 255, 40, 40);
        this.scene.cameras.main.shake(300, 0.008);

        this.isCoolingDown = true;
        this.cooldownUntil = this.scene.time.now + 1800;
        this.attackStartTime = this.cooldownUntil;

        this.scene.effects.createExplosion(this.x, this.y + 80);
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

        const attackDuration = 2800;
        const restDuration = 1900;

        if (now - this.attackStartTime > attackDuration) {
            this.isCoolingDown = true;
            this.cooldownUntil = now + restDuration;
            return;
        }

        this.updateShooting();
    }

    updateShooting() {
        const fireDelay = Math.max(760, this.stats.fireDelay - this.phase * 70);

        if (this.scene.time.now <= this.lastShotTime + fireDelay) return;

        this.firePattern();
        this.lastShotTime = this.scene.time.now;
    }

    firePattern() {
        if (!this.scene.player?.active) return;

        if (this.phase === 1) {
            this.fireAtPlayer(this.x, this.y + 125, 0.085);
        }

        if (this.phase === 2) {
            this.fireSpread(this.x, this.y + 118, 3, 0.062);
        }

        if (this.phase === 3) {
            this.fireSpread(this.x, this.y + 125, 5, 0.064);
        }
    }

    fireAtPlayer(x, y, scale = 0.1) {
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

    fireSpread(x, y, count = 3, scale = 0.08) {
        const spacing = 82;
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
        const dropY = this.y + 115;
        const dropX = Phaser.Math.Clamp(
            this.x,
            220,
            this.scene.scale.width - 220
        );

        this.scene.effects.createExplosion(dropX, dropY);
        this.scene.powerUpManager.spawnBossRewardPair(dropX, dropY);
    }

    takeDamage(amount = 1) {
        if (this.isDead || this.isEntering) return false;

        this.hp = Math.max(0, this.hp - amount);

        this.setTintFill(0xffffff);

        this.scene.tweens.add({
            targets: this,
            alpha: 0.72,
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