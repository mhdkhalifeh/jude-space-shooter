import Phaser from "phaser";
import Asteroid from "../entities/Asteroid";

export default class AsteroidManager {
    constructor(scene) {
        this.scene = scene;

        this.spawnTimer = null;
        this.stormTimer = null;
        this.stormEndTimer = null;

        this.isStormActive = false;

        this.normalSpawnDelay = 5200;
        this.stormSpawnDelay = 1200;

        this.nextStormDelayMin = 9000;
        this.nextStormDelayMax = 14000;
        this.stormDuration = 5500;
    }

    start() {
        this.startSpawnTimer(this.normalSpawnDelay);
        this.scheduleNextStorm();
    }

    stop() {
        if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = null;
        }

        if (this.stormTimer) {
            this.stormTimer.remove(false);
            this.stormTimer = null;
        }

        if (this.stormEndTimer) {
            this.stormEndTimer.remove(false);
            this.stormEndTimer = null;
        }

        this.isStormActive = false;
    }

    update() {
        if (this.scene.waveManager?.stage !== 2) return;

        this.scene.asteroids.getChildren().forEach((asteroid) => {
            if (asteroid.active) asteroid.update();
        });
    }

    canSpawnAsteroids() {
        return this.scene.waveManager?.stage === 2 &&
            this.scene.stage2Rules?.asteroids === true;
    }

    canStartStorm() {
        return this.scene.waveManager?.stage === 2 &&
            this.scene.stage2Rules?.storm === true;
    }

    startSpawnTimer(delay) {
        if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = null;
        }

        this.spawnTimer = this.scene.time.addEvent({
            delay,
            loop: true,
            callback: () => {
                if (this.scene.isGameOver) return;
                if (!this.canSpawnAsteroids()) return;

                this.spawnAsteroid();
            }
        });
    }

    scheduleNextStorm() {
        if (this.stormTimer) {
            this.stormTimer.remove(false);
            this.stormTimer = null;
        }

        const delay = Phaser.Math.Between(
            this.nextStormDelayMin,
            this.nextStormDelayMax
        );

        this.stormTimer = this.scene.time.delayedCall(delay, () => {
            if (this.scene.isGameOver) return;

            if (!this.canStartStorm()) {
                this.scheduleNextStorm();
                return;
            }

            this.startStorm();
        });
    }

    startStorm() {
        if (this.isStormActive) return;
        if (!this.canStartStorm()) return;

        this.isStormActive = true;
        this.showStormWarning();

        this.scene.cameras.main.flash(180, 255, 120, 40);
        this.scene.cameras.main.shake(500, 0.008);

        this.startSpawnTimer(this.stormSpawnDelay);

        for (let i = 0; i < 2; i++) {
            this.scene.time.delayedCall(i * 180, () => {
                if (this.canStartStorm()) {
                    this.spawnAsteroid();
                }
            });
        }

        this.stormEndTimer = this.scene.time.delayedCall(this.stormDuration, () => {
            this.endStorm();
        });
    }

    endStorm() {
        this.isStormActive = false;

        this.startSpawnTimer(this.normalSpawnDelay);
        this.scheduleNextStorm();

        this.showStormEnd();
    }

    showStormWarning() {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        const warning = this.scene.add.text(
            centerX,
            centerY - 80,
            "⚠ ASTEROID STORM ⚠",
            {
                fontSize: "46px",
                color: "#fb923c",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 8
            }
        ).setOrigin(0.5).setDepth(150);

        const sub = this.scene.add.text(
            centerX,
            centerY - 35,
            "DODGE THE BELT",
            {
                fontSize: "22px",
                color: "#fde68a",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 5
            }
        ).setOrigin(0.5).setDepth(150);

        this.scene.tweens.add({
            targets: [warning, sub],
            alpha: 0.2,
            duration: 180,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                warning.destroy();
                sub.destroy();
            }
        });
    }

    showStormEnd() {
        const text = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2 - 70,
            "STORM CLEARED",
            {
                fontSize: "30px",
                color: "#94A3B8",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 5
            }
        ).setOrigin(0.5).setDepth(150);

        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 30,
            duration: 900,
            ease: "Quad.easeOut",
            onComplete: () => text.destroy()
        });
    }

    spawnAsteroid() {
        if (!this.canSpawnAsteroids() && !this.isStormActive) return;

        const x = Phaser.Math.Between(40, this.scene.scale.width - 40);
        const y = -80;

        this.scene.asteroids.add(new Asteroid(this.scene, x, y));
    }
}