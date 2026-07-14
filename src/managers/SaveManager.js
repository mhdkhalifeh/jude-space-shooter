export default class SaveManager {
    constructor(scene = null) {
        this.scene = scene;
        this.storageKey = "jude_space_shooter_save_v1";

        this.defaultData = {
            version: 1,
            highScore: 0,
            highestStage: 1,
            highestWave: 1,
            totalRuns: 0,
            totalPlayTimeSeconds: 0,
            enemiesKilled: 0,
            eliteEnemiesKilled: 0,
            bossesKilled: 0,
            bosses: {
                alpha: 0,
                omega: 0,
                leviathan: 0
            },
            powerUpsCollected: 0,
            shieldsCollected: 0,
            doubleLasersCollected: 0,
            shotsFired: 0,
            damageTaken: 0,
            achievements: {},
            lastRun: {
                score: 0,
                stage: 1,
                wave: 1,
                date: null
            }
        };

        this.data = this.load();
        this.runStartedAt = null;
    }

    cloneDefaultData() {
        return JSON.parse(JSON.stringify(this.defaultData));
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return this.cloneDefaultData();

            const parsed = JSON.parse(raw);

            return this.mergeWithDefaults(
                this.cloneDefaultData(),
                parsed
            );
        } catch (error) {
            console.warn("SaveManager: Could not load save data.", error);
            return this.cloneDefaultData();
        }
    }

    mergeWithDefaults(defaultValue, savedValue) {
        if (
            typeof defaultValue !== "object" ||
            defaultValue === null ||
            Array.isArray(defaultValue)
        ) {
            return savedValue !== undefined ? savedValue : defaultValue;
        }

        const result = { ...defaultValue };

        if (
            typeof savedValue !== "object" ||
            savedValue === null ||
            Array.isArray(savedValue)
        ) {
            return result;
        }

        Object.keys(result).forEach((key) => {
            result[key] = this.mergeWithDefaults(
                result[key],
                savedValue[key]
            );
        });

        Object.keys(savedValue).forEach((key) => {
            if (!(key in result)) {
                result[key] = savedValue[key];
            }
        });

        return result;
    }

    save() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.data)
            );
            return true;
        } catch (error) {
            console.warn("SaveManager: Could not save data.", error);
            return false;
        }
    }

    reset() {
        this.data = this.cloneDefaultData();
        this.runStartedAt = null;
        this.save();
    }

    startRun() {
        this.runStartedAt = Date.now();
        this.data.totalRuns += 1;
        this.save();
    }

    endRun({ score = 0, stage = 1, wave = 1 } = {}) {
        this.updateHighScore(score);
        this.updateProgress(stage, wave);

        if (this.runStartedAt) {
            const elapsedSeconds = Math.max(
                0,
                Math.floor((Date.now() - this.runStartedAt) / 1000)
            );

            this.data.totalPlayTimeSeconds += elapsedSeconds;
        }

        this.data.lastRun = {
            score,
            stage,
            wave,
            date: new Date().toISOString()
        };

        this.runStartedAt = null;
        this.save();
    }

    updateHighScore(score) {
        const safeScore = Math.max(0, Number(score) || 0);

        if (safeScore > this.data.highScore) {
            this.data.highScore = safeScore;
            this.save();
            return true;
        }

        return false;
    }

    updateProgress(stage, wave) {
        const safeStage = Math.max(1, Number(stage) || 1);
        const safeWave = Math.max(1, Number(wave) || 1);

        let changed = false;

        if (safeStage > this.data.highestStage) {
            this.data.highestStage = safeStage;
            this.data.highestWave = safeWave;
            changed = true;
        } else if (
            safeStage === this.data.highestStage &&
            safeWave > this.data.highestWave
        ) {
            this.data.highestWave = safeWave;
            changed = true;
        }

        if (changed) this.save();
        return changed;
    }

    addEnemyKill({ elite = false } = {}) {
        this.data.enemiesKilled += 1;

        if (elite) {
            this.data.eliteEnemiesKilled += 1;
        }

        this.save();
    }

    addBossKill(bossKey = "alpha") {
        this.data.bossesKilled += 1;

        if (!(bossKey in this.data.bosses)) {
            this.data.bosses[bossKey] = 0;
        }

        this.data.bosses[bossKey] += 1;
        this.save();
    }

    addPowerUp(type = "unknown") {
        this.data.powerUpsCollected += 1;

        if (type === "shield") {
            this.data.shieldsCollected += 1;
        }

        if (type === "double") {
            this.data.doubleLasersCollected += 1;
        }

        this.save();
    }

    addShotsFired(amount = 1) {
        this.data.shotsFired += Math.max(0, Number(amount) || 0);
        this.save();
    }

    addDamageTaken(amount = 1) {
        this.data.damageTaken += Math.max(0, Number(amount) || 0);
        this.save();
    }

    unlockAchievement(id, extraData = {}) {
        if (!id || this.isAchievementUnlocked(id)) {
            return false;
        }

        this.data.achievements[id] = {
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            ...extraData
        };

        this.save();
        return true;
    }

    isAchievementUnlocked(id) {
        return this.data.achievements?.[id]?.unlocked === true;
    }

    getAchievement(id) {
        return this.data.achievements?.[id] || null;
    }

    getUnlockedAchievements() {
        return Object.entries(this.data.achievements || {})
            .filter(([, achievement]) => achievement?.unlocked === true)
            .map(([id, achievement]) => ({
                id,
                ...achievement
            }));
    }

    getHighScore() {
        return this.data.highScore;
    }

    getHighestStage() {
        return this.data.highestStage;
    }

    getHighestWave() {
        return this.data.highestWave;
    }

    getStats() {
        return JSON.parse(JSON.stringify(this.data));
    }

    getPlayTimeFormatted() {
        const totalSeconds = Math.max(
            0,
            this.data.totalPlayTimeSeconds || 0
        );

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const paddedMinutes = String(minutes).padStart(2, "0");
        const paddedSeconds = String(seconds).padStart(2, "0");

        if (hours > 0) {
            return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        }

        return `${minutes}:${paddedSeconds}`;
    }

    exportSave() {
        return JSON.stringify(this.data, null, 2);
    }

    importSave(jsonText) {
        try {
            const parsed = JSON.parse(jsonText);

            this.data = this.mergeWithDefaults(
                this.cloneDefaultData(),
                parsed
            );

            this.save();
            return true;
        } catch (error) {
            console.warn("SaveManager: Invalid save data.", error);
            return false;
        }
    }
}