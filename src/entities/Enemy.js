import Phaser from "phaser";
import { EnemyTypes } from "../config/EnemyTypes.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = "scout") {
        const baseStats = EnemyTypes[type] || EnemyTypes.scout;
        super(scene, x, y, baseStats.texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.stats = { ...baseStats };
        this.maxHp = this.stats.hp;
        this.hp = this.maxHp;
        this.shieldHits = this.stats.shieldHits || 0;
        this.startX = x;
        this.empUntil = 0;
        this.lastHealTime = 0;
        this.charging = false;
        this.sniperLocked = false;

        this.isEntering = true;
        this.canBeHit = false;
        this.canShoot = false;
        this.entryY = type === "elite" ? 95 : (this.stats.stopY || 35);
        this.entryPauseUntil = 0;
        this.hasEntered = false;

        this.dashTimer = 0;
        this.dashDirection = Phaser.Math.RND.pick([-1, 1]);
        this.dashCooldown = Phaser.Math.Between(450, 850);
        this.mineDropTimer = 0;
        this.mineDropCooldown = this.stats.mineCooldown || 2500;

        this.setDepth(type === "elite" ? 10 : 8);
        this.setFlipY(true);
        this.setScale(this.stats.scale);
        this.setTint(this.stats.tint || 0xffffff);

        if (this.shieldHits > 0) this.createShieldVisual();
    }

    takeDamage(amount = 1) {
        if (!this.canBeHit) return false;

        if (this.shieldHits > 0) {
            this.shieldHits -= 1;
            this.flashShield();
            return false;
        }

        this.hp -= amount;
        return this.hp <= 0;
    }

    heal(amount = 1) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    update() {
        const delta = this.scene.game.loop.delta / 1000;
        this.updateShieldVisual();
        this.updateEntry(delta);

        if (this.isEntering) return;
        if (this.scene.time.now < this.empUntil) {
            this.setAlpha(0.62);
            return;
        }
        this.setAlpha(1);

        switch (this.stats.movement) {
            case "wave":
                this.y += this.stats.speed * delta;
                this.updateWaveMovement();
                break;
            case "interceptor":
                this.y += this.stats.speed * delta;
                this.updateInterceptorMovement();
                break;
            case "mine_layer":
                this.y += this.stats.speed * delta;
                this.updateMineLayerMovement();
                break;
            case "sniper":
                this.updateSniperMovement(delta);
                break;
            case "kamikaze":
                this.updateKamikazeMovement(delta);
                break;
            case "medic":
                this.y += this.stats.speed * delta;
                this.updateWaveMovement();
                this.updateMedic();
                break;
            case "heavy":
                this.y += this.stats.speed * delta;
                this.angle = Math.sin(this.y * 0.006) * 3;
                break;
            default:
                this.y += this.stats.speed * delta;
        }

        if (this.y > this.scene.scale.height + 120) {
            this.scene.enemyEscaped?.(this);
            this.destroy();
        }
    }

    updateEntry(delta) {
        if (!this.isEntering) return;
        const entrySpeed = this.type === "elite" ? 360 : Math.max(150, this.stats.speed);
        this.y += entrySpeed * delta;

        if (this.y >= this.entryY && !this.hasEntered) {
            this.y = this.entryY;
            this.hasEntered = true;

            if (this.type === "elite") {
                this.scene.cameras.main.shake(180, 0.005);
                this.scene.effects.createExplosion(this.x, this.y + 45);
                this.entryPauseUntil = this.scene.time.now + 650;
                return;
            }
            this.finishEntry();
        }

        if (this.type === "elite" && this.hasEntered && this.scene.time.now >= this.entryPauseUntil) {
            this.finishEntry();
        }
    }

    finishEntry() {
        this.isEntering = false;
        this.canBeHit = true;
        this.canShoot = true;
        this.startX = this.x;
    }

    updateWaveMovement() {
        this.x = this.startX + Math.sin(this.y * (this.stats.waveSpeed || 0.004)) * (this.stats.waveAmplitude || 70);
    }

    updateInterceptorMovement() {
        if (!this.canShoot) return;
        this.dashTimer += this.scene.game.loop.delta;
        if (this.dashTimer >= this.dashCooldown) {
            this.dashTimer = 0;
            this.dashCooldown = Phaser.Math.Between(450, 850);
            this.dashDirection *= -1;
            this.scene.tweens.add({
                targets: this,
                x: Phaser.Math.Clamp(this.x + this.dashDirection * (this.stats.dashAmplitude || 120), 40, this.scene.scale.width - 40),
                duration: 180,
                ease: "Cubic.easeOut"
            });
        }
        this.angle = Phaser.Math.Linear(this.angle, this.dashDirection * 14, 0.08);
    }

    updateMineLayerMovement() {
        this.updateWaveMovement();
        this.angle = Phaser.Math.Linear(this.angle, Math.sin(this.y * 0.01) * 5, 0.05);
        if (!this.canShoot) return;

        this.mineDropTimer += this.scene.game.loop.delta;
        if (this.mineDropTimer >= this.mineDropCooldown && this.y > 100 && this.y < this.scene.scale.height - 180) {
            this.mineDropTimer = 0;
            this.scene.mineManager?.spawnMine?.(this.x, this.y + 45);
        }
    }

    updateSniperMovement(delta) {
        const stopY = this.stats.stopY || 145;
        if (this.y < stopY) {
            this.y += this.stats.speed * delta;
            return;
        }

        this.y = stopY;
        this.x = this.startX + Math.sin(this.scene.time.now * 0.0014) * 45;
        this.sniperLocked = true;
    }

    updateKamikazeMovement(delta) {
        const player = this.scene.player;
        if (!player?.active) {
            this.y += this.stats.speed * delta;
            return;
        }

        if (!this.charging && this.y > 105) {
            this.charging = true;
            this.scene.tweens.add({ targets: this, scaleX: this.scaleX * 1.18, scaleY: this.scaleY * 1.18, duration: 140, yoyo: true });
        }

        if (this.charging) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const speed = this.stats.chargeSpeed || 350;
            this.x += Math.cos(angle) * speed * delta;
            this.y += Math.sin(angle) * speed * delta;
            this.rotation = angle + Math.PI / 2;
        } else {
            this.y += this.stats.speed * delta;
        }
    }

    updateMedic() {
        if (this.scene.time.now < this.lastHealTime + (this.stats.healCooldown || 2400)) return;
        this.lastHealTime = this.scene.time.now;

        const allies = this.scene.enemies.getChildren().filter((enemy) =>
            enemy !== this && enemy.active && enemy.hp < enemy.maxHp &&
            Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < 210
        );

        allies.slice(0, 3).forEach((enemy) => {
            enemy.heal(this.stats.healAmount || 1);
            const beam = this.scene.add.line(0, 0, this.x, this.y, enemy.x, enemy.y, 0x4ade80, 0.65).setOrigin(0).setDepth(7);
            this.scene.tweens.add({ targets: beam, alpha: 0, duration: 260, onComplete: () => beam.destroy() });
        });
    }

    createShieldVisual() {
        this.enemyShield = this.scene.add.circle(this.x, this.y, 45, 0x22d3ee, 0.06)
            .setStrokeStyle(3, 0x67e8f9, 0.75)
            .setDepth(9);
    }

    updateShieldVisual() {
        if (!this.enemyShield) return;
        if (!this.active || this.shieldHits <= 0) {
            this.enemyShield.destroy();
            this.enemyShield = null;
            return;
        }
        this.enemyShield.setPosition(this.x, this.y);
        this.enemyShield.rotation += 0.025;
    }

    flashShield() {
        if (!this.enemyShield) return;
        this.scene.tweens.add({ targets: this.enemyShield, alpha: 0.65, scaleX: 1.25, scaleY: 1.25, duration: 90, yoyo: true });
        if (this.shieldHits <= 0) {
            this.scene.tweens.add({ targets: this.enemyShield, alpha: 0, scaleX: 1.7, scaleY: 1.7, duration: 220, onComplete: () => {
                this.enemyShield?.destroy();
                this.enemyShield = null;
            }});
        }
    }

    destroy(fromScene) {
        this.enemyShield?.destroy();
        this.enemyShield = null;
        super.destroy(fromScene);
    }
}
