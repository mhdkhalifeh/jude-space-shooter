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
        } while (
            this.lastEnemyX !== null &&
            Math.abs(x - this.lastEnemyX) < 260 &&
            tries < 10
        );

        this.lastEnemyX = x;
        return x;
    }

    applyDirectorEnemyMutation(enemyType, stage, wave) {
    const difficulty = stage * 10 + wave;

    let eliteChance = 0;

    if (difficulty >= 35) eliteChance = 6;
    if (difficulty >= 45) eliteChance = 9;
    if (difficulty >= 60) eliteChance = 12;
    if (difficulty >= 80) eliteChance = 15;

    if (
        enemyType !== "elite" &&
        stage >= 4 &&
        Phaser.Math.Between(1, 100) <= eliteChance
    ) {
        this.showEliteWarning();
        return "elite";
    }

    if (enemyType === "elite") {
        this.showEliteWarning();
    }

    return enemyType;
}

    getEliteChance(stage, wave, difficulty) {
        let chance = 6;

        if (stage >= 4) chance += 2;
        if (stage >= 6) chance += 2;
        if (wave >= 4) chance += 2;

        chance += Math.floor(difficulty * 0.8);

        return Phaser.Math.Clamp(chance, 6, 18);
    }

    getHeavyChance(stage, wave, difficulty) {
        let chance = 0;

        if (stage >= 4) chance = 4;
        if (stage >= 6) chance = 7;
        if (stage >= 8) chance = 10;
        if (wave >= 4) chance += 2;

        chance += Math.floor(difficulty * 0.5);

        return Phaser.Math.Clamp(chance, 0, 16);
    }

    applyEnemyScaling(enemy, stage, wave) {
    if (!enemy.stats) return;

    // من Stage 4 لا نرفع HP كثير حتى ما يحس اللاعب أن الرصاص ضعيف
    const hpBonus = Math.max(0, Math.floor((stage - 3) * 0.35));
    const speedBonus = Math.min(Math.floor((stage - 1) * 2), 28);

    enemy.stats.hp += hpBonus;

    if (enemy.stats.speed) {
        enemy.stats.speed += speedBonus;
    }

    if (enemy.stats.mineCooldown) {
        enemy.stats.mineCooldown = Math.max(
            1400,
            enemy.stats.mineCooldown - stage * 80
        );
    }
}
    applyEnemyVisualEffects(enemy) {
        if (!enemy.stats?.elite) return;

        enemy.setScale(enemy.scaleX * 1.15);
        enemy.setTint(0xffaa00);

        this.scene.tweens.add({
            targets: enemy,
            alpha: 0.55,
            duration: 180,
            yoyo: true,
            repeat: -1
        });
    }

    update() {
        this.scene.enemies.getChildren().forEach((enemy) => {
            if (!enemy.active) return;

            enemy.update();
            this.scene.shootingManager.handleEnemyShooting(enemy);
        });
    }

    showEliteWarning() {
        const txt = this.scene.add.text(
            this.scene.scale.width / 2,
            170,
            "⚠ ELITE ENEMY ⚠",
            {
                fontSize: "34px",
                color: "#ffcc00",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 6
            }
        )
        .setOrigin(0.5)
        .setDepth(100);

        this.scene.cameras.main.flash(180, 255, 180, 0);

        this.scene.tweens.add({
            targets: txt,
            alpha: 0,
            y: -30,
            duration: 1800,
            onComplete: () => txt.destroy()
        });
    }
}