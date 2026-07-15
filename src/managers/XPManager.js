export default class XPManager {
    constructor(scene) {
        this.scene = scene;

        this.storageKey = "jude_space_shooter_xp_v1";
        this.data = this.load();

        this.notificationQueue = [];
        this.isShowingNotification = false;
    }

    getDefaultData() {
        return {
            level: 1,
            currentXP: 0,
            totalXP: 0
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);

            if (!raw) {
                return this.getDefaultData();
            }

            const parsed = JSON.parse(raw);

            return {
                ...this.getDefaultData(),
                ...parsed
            };
        } catch (error) {
            console.warn("XPManager: Could not load XP data.", error);
            return this.getDefaultData();
        }
    }

    save() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.data)
            );
        } catch (error) {
            console.warn("XPManager: Could not save XP data.", error);
        }
    }

    reset() {
        this.data = this.getDefaultData();
        this.save();
    }

    getLevel() {
        return this.data.level;
    }

    getCurrentXP() {
        return this.data.currentXP;
    }

    getTotalXP() {
        return this.data.totalXP;
    }

    getXPRequiredForLevel(level = this.data.level) {
        const safeLevel = Math.max(1, Number(level) || 1);

        return Math.floor(
            500 +
            (safeLevel - 1) * 250 +
            Math.pow(safeLevel - 1, 1.35) * 90
        );
    }

    getProgressPercent() {
        const required = this.getXPRequiredForLevel();

        if (required <= 0) return 0;

        return Math.max(
            0,
            Math.min(
                1,
                this.data.currentXP / required
            )
        );
    }

    addXP(amount, reason = "XP GAINED") {
        const safeAmount = Math.max(
            0,
            Math.floor(Number(amount) || 0)
        );

        if (safeAmount <= 0) return false;

        this.data.currentXP += safeAmount;
        this.data.totalXP += safeAmount;

        this.notificationQueue.push({
            type: "xp",
            amount: safeAmount,
            reason
        });

        let leveledUp = false;

        while (
            this.data.currentXP >=
            this.getXPRequiredForLevel()
        ) {
            const required =
                this.getXPRequiredForLevel();

            this.data.currentXP -= required;
            this.data.level += 1;
            leveledUp = true;

            this.notificationQueue.push({
                type: "level",
                level: this.data.level
            });
        }

        this.save();
        this.showNextNotification();

        return leveledUp;
    }

    addEnemyXP(enemyType = "scout", isElite = false) {
        if (isElite) {
            this.addXP(50, "ELITE DESTROYED");
            return;
        }

        const rewards = {
            scout: 5,
            fighter: 10,
            bomber: 20,
            interceptor: 15,
            mine_layer: 20,
            sniper: 30,
            kamikaze: 22,
            shield_carrier: 40,
            medic: 38,
            heavy_cruiser: 70
        };

        const amount =
            rewards[enemyType] || 5;

        this.addXP(
            amount,
            `${String(enemyType).toUpperCase()} DESTROYED`
        );
    }

    addBossXP(bossKey = "alpha") {
        const rewards = {
            alpha: 500,
            omega: 750,
            leviathan: 1000
        };

        const names = {
            alpha: "ALPHA DEFEATED",
            omega: "OMEGA DEFEATED",
            leviathan: "LEVIATHAN DEFEATED"
        };

        this.addXP(
            rewards[bossKey] || 500,
            names[bossKey] || "BOSS DEFEATED"
        );
    }

    addStageClearXP(stage = 1) {
        const safeStage = Math.max(
            1,
            Number(stage) || 1
        );

        const amount =
            500 + safeStage * 150;

        this.addXP(
            amount,
            `STAGE ${safeStage} CLEARED`
        );
    }

    addAchievementXP(title = "ACHIEVEMENT") {
        this.addXP(
            250,
            `${title} UNLOCKED`
        );
    }

    showNextNotification() {
        if (this.isShowingNotification) return;
        if (this.notificationQueue.length === 0) return;
        if (!this.scene?.add) return;

        const item =
            this.notificationQueue.shift();

        this.isShowingNotification = true;

        if (item.type === "level") {
            this.showLevelUp(item.level);
            return;
        }

        this.showXPGain(
            item.amount,
            item.reason
        );
    }

    showXPGain(amount, reason) {
        const isMobile =
            this.scene.sys.game.device.input.touch ||
            window.innerWidth <= 900;

        const x = isMobile ? 28 : 36;
        const y = isMobile ? 128 : 122;

        const container =
            this.scene.add.container(x, y)
                .setDepth(4900)
                .setScrollFactor(0)
                .setAlpha(0);

        const glowLine =
            this.scene.add.rectangle(
                0,
                0,
                4,
                42,
                0x38bdf8,
                0.95
            ).setOrigin(0, 0.5);

        const xpText =
            this.scene.add.text(
                15,
                -12,
                `+${amount} XP`,
                {
                    fontSize: isMobile ? "17px" : "19px",
                    fontStyle: "bold",
                    color: "#7DD3FC",
                    stroke: "#020617",
                    strokeThickness: 4
                }
            ).setOrigin(0, 0.5);

        const reasonText =
            this.scene.add.text(
                15,
                12,
                reason,
                {
                    fontSize: isMobile ? "9px" : "10px",
                    fontStyle: "bold",
                    color: "#94A3B8",
                    letterSpacing: 1,
                    stroke: "#020617",
                    strokeThickness: 3
                }
            ).setOrigin(0, 0.5);

        container.add([
            glowLine,
            xpText,
            reasonText
        ]);

        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            x: x + 12,
            duration: 150,
            ease: "Quad.easeOut",
            onComplete: () => {
                this.scene.time.delayedCall(
                    650,
                    () => {
                        this.scene.tweens.add({
                            targets: container,
                            alpha: 0,
                            y: y - 12,
                            duration: 180,
                            ease: "Quad.easeIn",
                            onComplete: () => {
                                container.destroy(true);
                                this.isShowingNotification = false;
                                this.showNextNotification();
                            }
                        });
                    }
                );
            }
        });
    }

    showLevelUp(level) {
        const centerX =
            this.scene.scale.width / 2;

        const centerY =
            this.scene.scale.height / 2;

        const container =
            this.scene.add.container(
                centerX,
                centerY
            )
                .setDepth(5100)
                .setAlpha(0)
                .setScale(0.7);

        const glow =
            this.scene.add.circle(
                0,
                0,
                125,
                0xfacc15,
                0.12
            );

        const ring =
            this.scene.add.circle(
                0,
                0,
                95,
                0x000000,
                0
            ).setStrokeStyle(
                5,
                0xfacc15,
                0.9
            );

        const title =
            this.scene.add.text(
                0,
                -38,
                "LEVEL UP",
                {
                    fontSize: "38px",
                    fontStyle: "bold",
                    color: "#FACC15",
                    stroke: "#020617",
                    strokeThickness: 7
                }
            ).setOrigin(0.5);

        const levelText =
            this.scene.add.text(
                0,
                18,
                `LEVEL ${level}`,
                {
                    fontSize: "30px",
                    fontStyle: "bold",
                    color: "#FFFFFF",
                    stroke: "#020617",
                    strokeThickness: 6
                }
            ).setOrigin(0.5);

        container.add([
            glow,
            ring,
            title,
            levelText
        ]);

        this.scene.soundManager?.sfx?.(
            "powerup",
            0.85
        );

        this.scene.cameras.main.flash(
            180,
            255,
            210,
            70
        );

        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 320,
            ease: "Back.easeOut"
        });

        this.scene.tweens.add({
            targets: ring,
            angle: 360,
            duration: 1700,
            ease: "Sine.easeInOut"
        });

        this.scene.tweens.add({
            targets: glow,
            scaleX: 1.45,
            scaleY: 1.45,
            alpha: 0,
            duration: 1000,
            repeat: 1
        });

        this.scene.time.delayedCall(
            1900,
            () => {
                this.scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    scaleX: 1.18,
                    scaleY: 1.18,
                    duration: 260,
                    onComplete: () => {
                        container.destroy(true);
                        this.isShowingNotification = false;
                        this.showNextNotification();
                    }
                });
            }
        );
    }

    getProfileData() {
        return {
            level: this.getLevel(),
            currentXP: this.getCurrentXP(),
            requiredXP:
                this.getXPRequiredForLevel(),
            totalXP: this.getTotalXP(),
            progress:
                this.getProgressPercent()
        };
    }
}