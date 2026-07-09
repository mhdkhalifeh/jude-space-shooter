import Phaser from "phaser";
import { EnemyTypes } from "../config/EnemyTypes.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = "scout") {
        const stats = EnemyTypes[type] || EnemyTypes.scout;

        super(scene, x, y, stats.texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.stats = stats;
        this.hp = stats.hp;
        this.startX = x;

        this.isEntering = true;
        this.canBeHit = false;
        this.canShoot = false;
        this.entryY = type === "elite" ? 95 : 35;
        this.entryPauseUntil = 0;
        this.hasEntered = false;

        this.dashTimer = 0;
        this.dashDirection = Phaser.Math.RND.pick([-1, 1]);
        this.dashCooldown = Phaser.Math.Between(450, 850);

        this.mineDropTimer = 0;
        this.mineDropCooldown = stats.mineCooldown || 2500;

        this.setDepth(type === "elite" ? 10 : 8);
        this.setFlipY(true);
        this.setScale(stats.scale);
    }

    takeDamage(amount = 1) {
        if (!this.canBeHit) return false;

        this.hp -= amount;
        return this.hp <= 0;
    }

    update() {
        const delta = this.scene.game.loop.delta / 1000;

        this.updateEntry(delta);

        if (this.isEntering) return;

        this.y += this.stats.speed * delta;

        if (this.stats.movement === "wave") {
            this.updateWaveMovement();
        }

        if (this.stats.movement === "interceptor") {
            this.updateInterceptorMovement();
        }

        if (this.stats.movement === "mine_layer") {
            this.updateMineLayerMovement();
        }

        if (this.y > this.scene.scale.height + 120) {
            if (this.scene.enemyEscaped) {
                this.scene.enemyEscaped(this);
            }

            this.destroy();
        }
    }

    updateEntry(delta) {
        if (!this.isEntering) return;

        const entrySpeed = this.type === "elite" ? 360 : this.stats.speed;
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

        if (
            this.type === "elite" &&
            this.hasEntered &&
            this.scene.time.now >= this.entryPauseUntil
        ) {
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
        this.x =
            this.startX +
            Math.sin(this.y * this.stats.waveSpeed) * this.stats.waveAmplitude;
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
                x: Phaser.Math.Clamp(
                    this.x + this.dashDirection * (this.stats.dashAmplitude || 120),
                    40,
                    this.scene.scale.width - 40
                ),
                duration: 180,
                ease: "Cubic.easeOut"
            });
        }

        this.angle = Phaser.Math.Linear(
            this.angle,
            this.dashDirection * 14,
            0.08
        );
    }

    updateMineLayerMovement() {
        this.x =
            this.startX +
            Math.sin(this.y * this.stats.waveSpeed) * this.stats.waveAmplitude;

        this.angle = Phaser.Math.Linear(
            this.angle,
            Math.sin(this.y * 0.01) * 5,
            0.05
        );

        if (!this.canShoot) return;

        this.mineDropTimer += this.scene.game.loop.delta;

        if (
            this.mineDropTimer >= this.mineDropCooldown &&
            this.y > 100 &&
            this.y < this.scene.scale.height - 180
        ) {
            this.mineDropTimer = 0;

            if (this.scene.mineManager?.spawnMine) {
                this.scene.mineManager.spawnMine(this.x, this.y + 45);
            }
        }
    }
}