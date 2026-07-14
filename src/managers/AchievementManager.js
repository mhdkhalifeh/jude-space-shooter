export default class AchievementManager {
    constructor(scene) {
        this.scene = scene;

        this.lastCheckTime = 0;
        this.checkDelay = 500;

        this.queue = [];
        this.isShowingNotification = false;

        this.definitions = [
            {
                id: "first_blood",
                title: "FIRST BLOOD",
                description: "Destroy your first enemy.",
                icon: "✦",
                test: ({ stats }) => stats.enemiesKilled >= 1
            },
            {
                id: "enemy_hunter_100",
                title: "ENEMY HUNTER",
                description: "Destroy 100 enemies.",
                icon: "🎯",
                test: ({ stats }) => stats.enemiesKilled >= 100
            },
            {
                id: "enemy_destroyer_1000",
                title: "ENEMY DESTROYER",
                description: "Destroy 1,000 enemies.",
                icon: "💥",
                test: ({ stats }) => stats.enemiesKilled >= 1000
            },
            {
                id: "elite_hunter",
                title: "ELITE HUNTER",
                description: "Destroy 10 elite enemies.",
                icon: "⚡",
                test: ({ stats }) => stats.eliteEnemiesKilled >= 10
            },
            {
                id: "boss_hunter",
                title: "BOSS HUNTER",
                description: "Destroy your first boss.",
                icon: "👑",
                test: ({ stats }) => stats.bossesKilled >= 1
            },
            {
                id: "alpha_destroyed",
                title: "ALPHA DESTROYED",
                description: "Defeat Alpha Dreadnought.",
                icon: "🔴",
                test: ({ stats }) => (stats.bosses?.alpha || 0) >= 1
            },
            {
                id: "omega_destroyed",
                title: "OMEGA DESTROYED",
                description: "Defeat Omega Siege Cruiser.",
                icon: "🟣",
                test: ({ stats }) => (stats.bosses?.omega || 0) >= 1
            },
            {
                id: "leviathan_slayer",
                title: "LEVIATHAN SLAYER",
                description: "Defeat Leviathan Nebula Beast.",
                icon: "🐉",
                test: ({ stats }) => (stats.bosses?.leviathan || 0) >= 1
            },
            {
                id: "score_10000",
                title: "RISING ACE",
                description: "Reach a score of 10,000.",
                icon: "⭐",
                test: ({ score, stats }) =>
                    Math.max(score, stats.highScore || 0) >= 10000
            },
            {
                id: "score_100000",
                title: "SPACE LEGEND",
                description: "Reach a score of 100,000.",
                icon: "🌟",
                test: ({ score, stats }) =>
                    Math.max(score, stats.highScore || 0) >= 100000
            },
            {
                id: "stage_4",
                title: "INFINITE FRONTIER",
                description: "Reach Stage 4.",
                icon: "♾",
                test: ({ stage, stats }) =>
                    Math.max(stage, stats.highestStage || 1) >= 4
            },
            {
                id: "power_collector",
                title: "POWER COLLECTOR",
                description: "Collect 25 power-ups.",
                icon: "💎",
                test: ({ stats }) => stats.powerUpsCollected >= 25
            },
            {
                id: "shield_specialist",
                title: "SHIELD SPECIALIST",
                description: "Collect 15 shields.",
                icon: "🛡",
                test: ({ stats }) => stats.shieldsCollected >= 15
            },
            {
                id: "laser_specialist",
                title: "LASER SPECIALIST",
                description: "Collect 15 Double Laser power-ups.",
                icon: "🔷",
                test: ({ stats }) => stats.doubleLasersCollected >= 15
            }
        ];
    }

    update() {
        if (!this.scene.saveManager) return;
        if (this.scene.time.now < this.lastCheckTime + this.checkDelay) return;

        this.lastCheckTime = this.scene.time.now;
        this.check();
    }

    check() {
        const saveManager = this.scene.saveManager;
        if (!saveManager) return;

        const stats = saveManager.getStats();

        const context = {
            stats,
            score: this.scene.score || 0,
            stage:
                this.scene.waveManager?.stage ||
                this.scene.registry.get("currentStage") ||
                1,
            wave: this.scene.waveManager?.wave || 1
        };

        this.definitions.forEach((achievement) => {
            if (saveManager.isAchievementUnlocked(achievement.id)) return;

            let unlocked = false;

            try {
                unlocked = achievement.test(context) === true;
            } catch (error) {
                console.warn(
                    `Achievement check failed: ${achievement.id}`,
                    error
                );
            }

            if (!unlocked) return;

            const didUnlock = saveManager.unlockAchievement(
                achievement.id,
                {
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon
                }
            );

            if (didUnlock) {
                this.queue.push(achievement);
            }
        });

        this.showNextNotification();
    }

    showNextNotification() {
        if (this.isShowingNotification) return;
        if (this.queue.length === 0) return;

        const achievement = this.queue.shift();
        this.isShowingNotification = true;

        const panelWidth = 430;
        const panelHeight = 104;
        const targetX = this.scene.scale.width - panelWidth / 2 - 24;
        const y = 126;

        const container = this.scene.add.container(
            this.scene.scale.width + panelWidth,
            y
        )
            .setDepth(5000)
            .setScrollFactor(0);

        const shadow = this.scene.add.rectangle(
            7,
            8,
            panelWidth,
            panelHeight,
            0x000000,
            0.42
        );

        const panel = this.scene.add.rectangle(
            0,
            0,
            panelWidth,
            panelHeight,
            0x07111f,
            0.96
        ).setStrokeStyle(3, 0xfacc15, 0.92);

        const icon = this.scene.add.text(
            -panelWidth / 2 + 28,
            0,
            achievement.icon,
            {
                fontSize: "38px"
            }
        ).setOrigin(0, 0.5);

        const unlockedText = this.scene.add.text(
            -panelWidth / 2 + 92,
            -31,
            "ACHIEVEMENT UNLOCKED",
            {
                fontSize: "12px",
                fontStyle: "bold",
                color: "#FACC15",
                letterSpacing: 2
            }
        );

        const title = this.scene.add.text(
            -panelWidth / 2 + 92,
            -8,
            achievement.title,
            {
                fontSize: "22px",
                fontStyle: "bold",
                color: "#FFFFFF",
                stroke: "#020617",
                strokeThickness: 4
            }
        );

        const description = this.scene.add.text(
            -panelWidth / 2 + 92,
            23,
            achievement.description,
            {
                fontSize: "14px",
                color: "#CBD5E1"
            }
        );

        container.add([
            shadow,
            panel,
            icon,
            unlockedText,
            title,
            description
        ]);

        this.scene.soundManager?.sfx?.("powerup", 0.7);

        this.scene.tweens.add({
            targets: container,
            x: targetX,
            duration: 350,
            ease: "Back.easeOut",
            onComplete: () => {
                this.scene.time.delayedCall(2600, () => {
                    this.scene.tweens.add({
                        targets: container,
                        x: this.scene.scale.width + panelWidth,
                        alpha: 0,
                        duration: 320,
                        ease: "Quad.easeIn",
                        onComplete: () => {
                            container.destroy(true);
                            this.isShowingNotification = false;
                            this.showNextNotification();
                        }
                    });
                });
            }
        });
    }

    getDefinitions() {
        return this.definitions.map((achievement) => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon
        }));
    }
}