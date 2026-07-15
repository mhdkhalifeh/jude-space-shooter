import { getStageConfig } from "../config/Stages.js";
import WaveGenerator from "../systems/WaveGenerator.js";
export default class WaveManager {
    constructor(scene) {
        this.scene = scene;

       this.stage =
    this.scene.checkpointManager?.getStartStage?.() ||
    this.scene.registry.get("currentStage") ||
    1;

this.scene.registry.set("currentStage", this.stage);
        this.wave = this.scene.checkpointManager?.getStartWave?.() || 1;

        

        this.enemyQueue = [];
        this.enemiesToSpawn = 0;
        this.enemiesKilled = 0;
        this.bossStarted = false;
        this.bossStarted = false;
        this.isWaveActive = true;
        this.spawnTimer = null;
        this.waitingForBoss = false;
        this.generatedStageConfig = null;

        this.prepareWave();
    }

    start() {
        this.showWaveBanner(`STAGE ${this.stage} - WAVE ${this.wave}`);

        this.spawnTimer = this.scene.time.addEvent({
            delay: this.getSpawnDelay(),
            loop: true,
            callback: () => {
                if (this.scene.isGameOver || this.waitingForBoss) return;

                if (this.isWaveActive && this.enemiesToSpawn > 0) {
                    this.scene.enemyManager.spawnEnemy();
                    this.enemiesToSpawn--;
                }
            }
        });
    }

    stop() {
        if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = null;
        }
    }

    update() {}

    getStageConfig() {
    const staticConfig = getStageConfig(this.stage);

    if (staticConfig?.id === this.stage) {
        return staticConfig;
    }

    return {
        id: this.stage,
        name: `INFINITE SECTOR ${this.stage}`,
        background: this.getGeneratedBackground(),
        titleColor: "#38BDF8",
        spawnDelay: Math.max(600, 1300 - this.stage * 60),
        boss: this.getGeneratedBoss(),
        waves: {
            1: WaveGenerator.generate(this.stage, 1),
            2: WaveGenerator.generate(this.stage, 2),
            3: WaveGenerator.generate(this.stage, 3),
            4: WaveGenerator.generate(this.stage, 4),
            5: WaveGenerator.generate(this.stage, 5)
        },
        rules: WaveGenerator.getRules(this.stage, this.wave)
    };
}

    prepareWave() {
        this.enemyQueue = this.getWaveEnemyList();
        this.enemiesToSpawn = this.enemyQueue.length;
        this.applyStageRules();
    }

   getWaveEnemyList() {
    const stageConfig = this.getStageConfig();
    const waveList = stageConfig.waves?.[this.wave];

    if (waveList && waveList.length > 0) {
        return [...waveList];
    }

    // من Stage 4 وطالع يولّد تلقائي
    if (this.stage >= 4) {
        return WaveGenerator.generate(this.stage, this.wave);
    }

    return ["scout", "fighter", "scout", "fighter"];
}

    applyStageRules() {
    const stageConfig = this.getStageConfig();

    const staticRules =
        stageConfig.rulesByWave?.[this.wave] ||
        stageConfig.rules ||
        {};

    const generatedRules =
        this.stage >= 4
            ? WaveGenerator.getRules(this.stage, this.wave)
            : {};

    const rules = {
        ...staticRules,
        ...generatedRules
    };

    this.scene.stage2Rules = {
        asteroids: rules.asteroids === true,
        storm: rules.storm === true
    };
}

    getNextEnemyType() {
        if (this.enemyQueue.length <= 0) return "scout";
        return this.enemyQueue.shift();
    }

    enemyKilled() {
        this.enemiesKilled++;
        this.checkWaveComplete();
    }

    checkWaveComplete() {
        if (this.enemiesToSpawn > 0) return;
        if (this.scene.enemies.getChildren().length > 0) return;

        this.isWaveActive = false;
        this.scene.checkpointManager.saveWaveCheckpoint(
    this.stage,
    this.wave,
    this.scene.score
);

        if (this.shouldStartBoss()) {
            this.waitingForBoss = true;

            this.scene.time.delayedCall(1200, () => {
                this.startStageBoss();
            });

            return;
        }

        this.showWaveBanner(`WAVE ${this.wave} COMPLETE`);

        this.scene.time.delayedCall(2000, () => {
            this.startNextWave();
        });
    }

    shouldStartBoss() {
        const stageConfig = this.getStageConfig();
        const totalWaves = Object.keys(stageConfig.waves || {}).length;

        return this.wave >= totalWaves;
    }

   startStageBoss() {
    if (this.bossStarted) return;

    this.bossStarted = true;

    const stageConfig = this.getStageConfig();
    const boss = stageConfig.boss || "alpha";

    if (boss === "alpha") {
        this.scene.bossManager.startBossAlpha();
        return;
    }

    if (boss === "omega") {
        this.scene.bossManager.startBossOmega();
        return;
    }

    if (boss === "leviathan") {
        this.scene.bossManager.startBossLeviathan();
        return;
    }

    this.scene.bossManager.startBossAlpha();
}
   resumeAfterBoss() {
    this.waitingForBoss = false;

    const nextStage = this.stage + 1;

    this.startStageTransition(nextStage);
}

    startStageTransition(nextStage) {
        this.stop();

        this.scene.registry.set("currentStage", nextStage);
        this.stage = nextStage;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.bossStarted = false;
        this.generatedStageConfig = null;

        const nextConfig = this.getStageConfig();

        this.prepareWave();

        if (this.scene.bg?.setTexture && nextConfig.background) {
            this.scene.cameras.main.fadeOut(350, 0, 0, 0);

            this.scene.time.delayedCall(380, () => {
                this.scene.bg.setTexture(nextConfig.background);
                this.scene.cameras.main.fadeIn(500, 0, 0, 0);
            });
        }

        this.isWaveActive = false;
        this.clearStageObjects();

        this.showStageIntro(nextConfig, () => {
            this.isWaveActive = true;
            this.waitingForBoss = false;

            this.scene.checkpointManager.saveWaveCheckpoint(
    this.stage,
    this.wave,
    this.scene.score
);
            this.showWaveBanner(`STAGE ${this.stage} - WAVE ${this.wave}`);
            this.start();
        });
    }

    clearStageObjects() {
        this.scene.enemies?.clear(true, true);
        this.scene.enemyBullets?.clear(true, true);
        this.scene.bullets?.clear(true, true);
        this.scene.asteroids?.clear(true, true);
        this.scene.mines?.clear(true, true);
        this.scene.powerUps?.clear(true, true);
    }

    startNextWave() {
        this.wave++;
        this.enemiesKilled = 0;
        this.bossStarted = false;

        this.prepareWave();
        this.isWaveActive = true;

        this.scene.checkpointManager.saveWaveCheckpoint(
    this.stage,
    this.wave,
    this.scene.score
);
        this.showWaveBanner(`STAGE ${this.stage} - WAVE ${this.wave}`);
    }

    showStageIntro(stageConfig, onComplete) {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        const overlay = this.scene.add.rectangle(
            centerX,
            centerY,
            this.scene.scale.width,
            this.scene.scale.height,
            0x020617,
            0.72
        ).setDepth(130);

        const title = this.scene.add.text(centerX, centerY - 70, `STAGE ${stageConfig.id}`, {
            fontSize: "68px",
            color: stageConfig.titleColor || "#A78BFA",
            fontStyle: "bold",
            stroke: "#020617",
            strokeThickness: 9
        }).setOrigin(0.5).setDepth(131);

        const subtitle = this.scene.add.text(centerX, centerY, stageConfig.name || "UNKNOWN SPACE", {
            fontSize: "38px",
            color: "#CBD5E1",
            fontStyle: "bold",
            stroke: "#020617",
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(131);

        this.scene.time.delayedCall(2800, () => {
            overlay.destroy();
            title.destroy();
            subtitle.destroy();
            onComplete?.();
        });
    }

    showWaveBanner(text) {
        const stageConfig = this.getStageConfig();

        const banner = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            text,
            {
                fontSize: "54px",
                color: stageConfig.titleColor || "#38BDF8",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 8
            }
        ).setOrigin(0.5).setDepth(60);

        this.scene.time.delayedCall(2000, () => {
            if (banner.active) banner.destroy();
        });
    }

    getGeneratedBoss() {
    const bosses = ["alpha", "omega", "leviathan"];
    return bosses[(this.stage - 1) % bosses.length];
}

getGeneratedBackground() {
    const backgrounds = [
        "background_space",
        "background_stage2",
        "background_stage3",
        "background_quantum_rift",
        "background_frozen_void"
    ];

    return backgrounds[(this.stage - 1) % backgrounds.length];
}
getSpawnDelay() {
    const stageConfig = this.getStageConfig?.();

    if (stageConfig?.spawnDelay) {
        return stageConfig.spawnDelay;
    }

    return Math.max(600, 1300 - this.stage * 60);
}
}