import Phaser from "phaser";
import Player from "../entities/Player";
import ParallaxManager from "../managers/ParallaxManager";

import EffectsManager from "../managers/EffectsManager";
import HUDManager from "../managers/HUDManager";
import EnemyManager from "../managers/EnemyManager";
import ShootingManager from "../managers/ShootingManager";
import CollisionManager from "../managers/CollisionManager";
import PowerUpManager from "../managers/PowerUpManager";
import WaveManager from "../managers/WaveManager";
import BossManager from "../managers/BossManager";
import CheckpointManager from "../managers/CheckpointManager";
import UpgradeManager from "../managers/UpgradeManager";
import AsteroidManager from "../managers/AsteroidManager";
import MineManager from "../managers/MineManager";
import SoundManager from "../managers/SoundManager";
import PauseMenu from "../ui/PauseMenu";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        this.soundManager = new SoundManager(this);

        const menuMusic = this.sound.get("menu_music");
        if (menuMusic) {
            menuMusic.stop();
        }

        this.soundManager.playMusic("game_music", 0.22);

        const { width, height } = this.scale;

        this.isGameOver = false;
        this.isPausedByMenu = false;
        this.stageEnvironment = this.registry.get("currentStage") || 1;

        this.checkpointManager = new CheckpointManager(this);
        this.upgradeManager = new UpgradeManager(this);

        this.score = this.checkpointManager.getStartScore();
        this.playerHP = 3;
        this.playerInvincible = false;

        this.bg = this.add.tileSprite(
            width / 2,
            height / 2,
            width,
            height,
            "background_space"
        );

        this.stage2Overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x4c1d95,
            0
        ).setDepth(1);

        this.spaceDust = this.add.group();
        this.farAsteroids = this.add.group();

        this.createSpaceDust();
        this.createFarAsteroids();

        this.player = new Player(this, width / 2, height - 180);

        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        this.asteroids = this.physics.add.group();
        this.mines = this.physics.add.group();

        this.effects = new EffectsManager(this);

        this.hud = new HUDManager(this);
        this.hud.create();
        this.hud.updateScore(this.score);
        this.hud.updateHP(this.playerHP);

        this.enemyManager = new EnemyManager(this);
        this.powerUpManager = new PowerUpManager(this);
        this.shootingManager = new ShootingManager(this);
        this.collisionManager = new CollisionManager(this);
        this.bossManager = new BossManager(this);
        this.waveManager = new WaveManager(this);
        this.asteroidManager = new AsteroidManager(this);
        this.mineManager = new MineManager(this);

        this.asteroidManager.start();
        this.parallaxManager = new ParallaxManager(this);

        this.physics.add.overlap(
            this.bullets,
            this.enemies,
            this.collisionManager.handleBulletEnemyCollision,
            null,
            this.collisionManager
        );

        this.pauseMenu = new PauseMenu(this);

        this.events.once("shutdown", () => {
            this.pauseMenu?.destroy();
        });

        this.waveManager.start();
    }

    update() {
        if (this.isPausedByMenu) return;

        const currentStage =
            this.waveManager?.stage ||
            this.registry.get("currentStage") ||
            1;

        if (currentStage === 1) {
            this.bg.tilePositionY -= 0.4;
        } else {
            this.bg.tilePositionY = 0;
        }

        this.updateStageEnvironment(currentStage);

        if (this.isGameOver) return;

        this.player.update(this.input.activePointer);
        this.parallaxManager.update();
        this.shootingManager.update();
        this.enemyManager.update();
        this.powerUpManager.update();
        this.bossManager.update();
        this.collisionManager.update();
        this.waveManager.update();
        this.asteroidManager.update();
        this.mineManager.update();

        this.checkBossBulletHits();
    }

    createSpaceDust() {
        const { width, height } = this.scale;

        for (let i = 0; i < 45; i++) {
            const dust = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(1, 2.8),
                0xc4b5fd,
                Phaser.Math.FloatBetween(0.05, 0.16)
            ).setDepth(2);

            dust.speed = Phaser.Math.FloatBetween(0.35, 1.2);
            this.spaceDust.add(dust);
        }
    }

    createFarAsteroids() {
        const { width, height } = this.scale;

        for (let i = 0; i < 10; i++) {
            const rock = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(8, 22),
                0x1f2937,
                Phaser.Math.FloatBetween(0.16, 0.32)
            ).setDepth(3);

            rock.speed = Phaser.Math.FloatBetween(0.25, 0.75);
            rock.spin = Phaser.Math.FloatBetween(-0.01, 0.01);

            this.farAsteroids.add(rock);
        }
    }

    updateStageEnvironment(currentStage) {
        const { width, height } = this.scale;

        const targetAlpha = currentStage === 2 ? 0.34 : 0;

        if (this.stage2Overlay.alpha !== targetAlpha) {
            this.stage2Overlay.alpha = Phaser.Math.Linear(
                this.stage2Overlay.alpha,
                targetAlpha,
                0.035
            );
        }

        this.spaceDust.getChildren().forEach((dust) => {
            dust.alpha = currentStage === 2
                ? Phaser.Math.Clamp(dust.alpha + 0.002, 0.08, 0.26)
                : Phaser.Math.Clamp(dust.alpha - 0.004, 0, 0.14);

            dust.y += currentStage === 2 ? dust.speed * 2.4 : dust.speed;

            if (dust.y > height + 10) {
                dust.y = -10;
                dust.x = Phaser.Math.Between(0, width);
            }
        });

        this.farAsteroids.getChildren().forEach((rock) => {
            rock.alpha = currentStage === 2
                ? Phaser.Math.Clamp(rock.alpha + 0.003, 0.18, 0.38)
                : Phaser.Math.Clamp(rock.alpha - 0.004, 0, 0.2);

            rock.y += currentStage === 2 ? rock.speed * 2.2 : rock.speed * 0.45;
            rock.rotation += rock.spin;

            if (rock.y > height + 60) {
                rock.y = -60;
                rock.x = Phaser.Math.Between(0, width);
            }
        });
    }

    checkBossBulletHits() {
        const boss = this.bossManager?.activeBoss;

        if (!boss || !boss.active || boss.isDead) return;

        this.bullets.getChildren().forEach((bullet) => {
            if (!bullet.active) return;

            const currentBoss = this.bossManager?.activeBoss;

            if (!currentBoss || !currentBoss.active || currentBoss.isDead) return;

            const distance = Phaser.Math.Distance.Between(
                bullet.x,
                bullet.y,
                currentBoss.x,
                currentBoss.y
            );

            if (distance < 210) {
                this.bossManager.damageBoss(bullet);
            }
        });
    }

    addScore(amount) {
        this.score += amount;
        this.hud.updateScore(this.score);
    }

    enemyEscaped(enemy) {
        if (this.isGameOver || this.isPausedByMenu) return;

        this.damagePlayer();

        this.time.delayedCall(50, () => {
            this.waveManager?.checkWaveComplete?.();
        });
    }

    damagePlayer() {
        if (this.playerInvincible || this.isGameOver || this.isPausedByMenu) return;

        if (this.powerUpManager?.hasShield?.()) {
            this.powerUpManager.breakShield();
            return;
        }

        this.playerHP = Math.max(0, this.playerHP - 1);
        this.hud.updateHP(this.playerHP);

        this.playerInvincible = true;
        this.cameras.main.shake(90, 0.005);

        const hitFlash = this.add.circle(
            this.player.x,
            this.player.y,
            35,
            0xff3333,
            0.6
        ).setDepth(30);

        this.tweens.add({
            targets: hitFlash,
            scale: 2,
            alpha: 0,
            duration: 250,
            ease: "Quad.easeOut",
            onComplete: () => hitFlash.destroy()
        });

        this.time.delayedCall(700, () => {
            this.playerInvincible = false;
        });

        if (this.playerHP <= 0) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.pauseMenu?.pauseButton?.setVisible(false);
        this.waveManager.stop();

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 30, "GAME OVER", {
            fontSize: "64px",
            color: "#ff4444"
        }).setOrigin(0.5).setDepth(100);

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 35, `SCORE: ${this.score}`, {
            fontSize: "30px",
            color: "#38BDF8"
        }).setOrigin(0.5).setDepth(100);

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 85, "PRESS SPACE TO RETRY CHECKPOINT", {
            fontSize: "24px",
            color: "#CBD5E1"
        }).setOrigin(0.5).setDepth(100);

        this.input.keyboard.once("keydown-SPACE", () => {
            this.checkpointManager.restartFromCheckpoint();
        });
    }
}