import Phaser from "phaser";
import Enemy from "../entities/Enemy";

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.lastEnemyX = null;
    }

    spawnEnemy() {
        if (this.scene.isGameOver) return;
        const width = this.scene.scale.width;
        const stage = this.scene.waveManager?.stage || 1;
        const wave = this.scene.waveManager?.wave || 1;
        const x = this.getSafeSpawnX(width);

        let enemyType = this.scene.waveManager?.getNextEnemyType?.() || "scout";
        enemyType = this.applyDirectorEnemyMutation(enemyType, stage, wave);

        const enemy = new Enemy(this.scene, x, -140, enemyType);
        this.applyEnemyScaling(enemy, stage, wave);
        this.applyEnemyVisualEffects(enemy);
        this.scene.enemies.add(enemy);
    }

    getSafeSpawnX(width) {
        let x;
        let tries = 0;
        do {
            x = Phaser.Math.Between(120, width - 120);
            tries++;
        } while (this.lastEnemyX !== null && Math.abs(x - this.lastEnemyX) < 220 && tries < 10);
        this.lastEnemyX = x;
        return x;
    }

    applyDirectorEnemyMutation(enemyType, stage, wave) {
        const difficulty = stage * 10 + wave;
        let eliteChance = difficulty >= 80 ? 15 : difficulty >= 60 ? 12 : difficulty >= 45 ? 9 : difficulty >= 35 ? 6 : 0;
        if (enemyType !== "elite" && stage >= 4 && Phaser.Math.Between(1, 100) <= eliteChance) {
            this.showEliteWarning();
            return "elite";
        }
        if (enemyType === "elite") this.showEliteWarning();
        return enemyType;
    }

    applyEnemyScaling(enemy, stage, wave) {
        const hpMultiplier = 1 + Math.max(0, stage - 3) * 0.055 + Math.max(0, wave - 1) * 0.02;
        const speedBonus = Math.min(Math.floor((stage - 1) * 2), 28);
        enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * hpMultiplier));
        enemy.hp = enemy.maxHp;
        enemy.stats.speed += speedBonus;
        if (enemy.stats.mineCooldown) enemy.mineDropCooldown = Math.max(1400, enemy.stats.mineCooldown - stage * 70);
    }

    applyEnemyVisualEffects(enemy) {
        if (!enemy.stats?.elite) return;
        enemy.setScale(enemy.scaleX * 1.15);
        this.scene.tweens.add({ targets: enemy, alpha: 0.58, duration: 180, yoyo: true, repeat: -1 });
    }

    update() {
        this.scene.enemies.getChildren().forEach((enemy) => {
            if (!enemy.active) return;
            enemy.update();
            this.scene.shootingManager.handleEnemyShooting(enemy);
        });
    }

    showEliteWarning() {
        const txt = this.scene.add.text(this.scene.scale.width / 2, 170, "⚠ ELITE ENEMY ⚠", {
            fontFamily: "Oxanium, sans-serif",
            fontSize: "30px",
            color: "#ffcc00",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);
        this.scene.cameras.main.flash(180, 255, 180, 0);
        this.scene.tweens.add({ targets: txt, alpha: 0, y: 140, duration: 1600, onComplete: () => txt.destroy() });
    }
}
