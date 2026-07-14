import Phaser from "phaser";
import SaveManager from "../managers/SaveManager";
import AchievementManager from "../managers/AchievementManager";

export default class ProfileScene extends Phaser.Scene {
    constructor() {
        super("ProfileScene");
    }

    create() {
        const { width, height } = this.scale;

        this.saveManager = new SaveManager(this);
        this.achievementManager = new AchievementManager(this);

        this.cameras.main.setBackgroundColor("#020617");

        if (this.textures.exists("background_space")) {
            this.add.image(width / 2, height / 2, "background_space")
                .setDisplaySize(width, height)
                .setAlpha(0.42);
        }

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x020617,
            0.74
        );

        this.createStars(width, height);
        this.createHeader(width);
        this.createProfileSummary(width);
        this.createStatistics(width);
        this.createAchievements(width, height);
        this.createBackButton(width, height);
    }

    createHeader(width) {
        this.add.text(
            width / 2,
            52,
            "PLAYER PROFILE",
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: "#38BDF8",
                stroke: "#020617",
                strokeThickness: 8
            }
        )
            .setOrigin(0.5)
            .setDepth(20);

        this.add.text(
            width / 2,
            95,
            "JUDE SPACE SHOOTER",
            {
                fontSize: "18px",
                fontStyle: "bold",
                color: "#94A3B8",
                letterSpacing: 4
            }
        )
            .setOrigin(0.5)
            .setDepth(20);
    }

    createProfileSummary(width) {
        const stats = this.saveManager.getStats();

        const panelX = width / 2;
        const panelY = 165;
        const panelWidth = Math.min(1040, width - 80);
        const panelHeight = 120;

        this.createPanel(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            0x38bdf8
        );

        const items = [
            {
                label: "HIGH SCORE",
                value: Number(stats.highScore || 0).toLocaleString("en-US"),
                color: "#7DD3FC"
            },
            {
                label: "HIGHEST STAGE",
                value: `${stats.highestStage || 1} - ${stats.highestWave || 1}`,
                color: "#C4B5FD"
            },
            {
                label: "TOTAL RUNS",
                value: String(stats.totalRuns || 0),
                color: "#86EFAC"
            },
            {
                label: "PLAY TIME",
                value: this.saveManager.getPlayTimeFormatted(),
                color: "#FACC15"
            }
        ];

        const spacing = panelWidth / items.length;

        items.forEach((item, index) => {
            const x =
                panelX -
                panelWidth / 2 +
                spacing * index +
                spacing / 2;

            this.add.text(
                x,
                panelY - 25,
                item.label,
                {
                    fontSize: "13px",
                    fontStyle: "bold",
                    color: "#94A3B8",
                    letterSpacing: 2
                }
            )
                .setOrigin(0.5)
                .setDepth(22);

            this.add.text(
                x,
                panelY + 17,
                item.value,
                {
                    fontSize: "30px",
                    fontStyle: "bold",
                    color: item.color,
                    stroke: "#020617",
                    strokeThickness: 5
                }
            )
                .setOrigin(0.5)
                .setDepth(22);
        });
    }

    createStatistics(width) {
        const stats = this.saveManager.getStats();

        const leftX = width / 2 - 270;
        const rightX = width / 2 + 270;
        const startY = 285;

        this.add.text(
            width / 2,
            255,
            "COMBAT STATISTICS",
            {
                fontSize: "25px",
                fontStyle: "bold",
                color: "#E2E8F0",
                stroke: "#020617",
                strokeThickness: 5
            }
        )
            .setOrigin(0.5)
            .setDepth(20);

        const leftStats = [
            ["Enemies Destroyed", stats.enemiesKilled || 0],
            ["Elite Enemies", stats.eliteEnemiesKilled || 0],
            ["Bosses Defeated", stats.bossesKilled || 0],
            ["Shots Fired", stats.shotsFired || 0]
        ];

        const rightStats = [
            ["Power-Ups Collected", stats.powerUpsCollected || 0],
            ["Shields Collected", stats.shieldsCollected || 0],
            ["Double Lasers", stats.doubleLasersCollected || 0],
            ["Damage Taken", stats.damageTaken || 0]
        ];

        this.createStatColumn(leftX, startY, leftStats, 0x38bdf8);
        this.createStatColumn(rightX, startY, rightStats, 0xa78bfa);

        const bossY = startY + 190;

        this.add.text(
            width / 2,
            bossY - 12,
            "BOSS RECORD",
            {
                fontSize: "18px",
                fontStyle: "bold",
                color: "#FCA5A5",
                letterSpacing: 2
            }
        )
            .setOrigin(0.5)
            .setDepth(20);

        const bossData = [
            ["ALPHA", stats.bosses?.alpha || 0, "#FF6B6B"],
            ["OMEGA", stats.bosses?.omega || 0, "#C4B5FD"],
            ["LEVIATHAN", stats.bosses?.leviathan || 0, "#86EFAC"]
        ];

        bossData.forEach((boss, index) => {
            const x = width / 2 + (index - 1) * 180;

            this.add.text(
                x,
                bossY + 26,
                boss[0],
                {
                    fontSize: "14px",
                    fontStyle: "bold",
                    color: boss[2]
                }
            )
                .setOrigin(0.5)
                .setDepth(20);

            this.add.text(
                x,
                bossY + 58,
                String(boss[1]),
                {
                    fontSize: "26px",
                    fontStyle: "bold",
                    color: "#FFFFFF"
                }
            )
                .setOrigin(0.5)
                .setDepth(20);
        });
    }

    createStatColumn(x, y, data, borderColor) {
        this.createPanel(
            x,
            y + 70,
            460,
            170,
            borderColor
        );

        data.forEach((item, index) => {
            const rowY = y + index * 38;

            this.add.text(
                x - 190,
                rowY,
                item[0],
                {
                    fontSize: "16px",
                    color: "#CBD5E1"
                }
            )
                .setOrigin(0, 0.5)
                .setDepth(22);

            this.add.text(
                x + 190,
                rowY,
                Number(item[1]).toLocaleString("en-US"),
                {
                    fontSize: "18px",
                    fontStyle: "bold",
                    color: "#FFFFFF"
                }
            )
                .setOrigin(1, 0.5)
                .setDepth(22);
        });
    }

    createAchievements(width, height) {
        const definitions =
            this.achievementManager.getDefinitions();

        const unlocked =
            this.saveManager.getUnlockedAchievements();

        const unlockedIds =
            new Set(unlocked.map((item) => item.id));

        const y = height - 150;

        this.add.text(
            width / 2,
            y - 85,
            `ACHIEVEMENTS  ${unlocked.length}/${definitions.length}`,
            {
                fontSize: "24px",
                fontStyle: "bold",
                color: "#FACC15",
                stroke: "#020617",
                strokeThickness: 5
            }
        )
            .setOrigin(0.5)
            .setDepth(20);

        const visibleAchievements = definitions.slice(0, 7);
        const spacing = Math.min(150, (width - 120) / visibleAchievements.length);

        visibleAchievements.forEach((achievement, index) => {
            const isUnlocked = unlockedIds.has(achievement.id);

            const x =
                width / 2 -
                ((visibleAchievements.length - 1) * spacing) / 2 +
                index * spacing;

            const circle = this.add.circle(
                x,
                y,
                42,
                isUnlocked ? 0x302408 : 0x111827,
                0.95
            )
                .setStrokeStyle(
                    3,
                    isUnlocked ? 0xfacc15 : 0x334155,
                    isUnlocked ? 1 : 0.7
                )
                .setDepth(20);

            const icon = this.add.text(
                x,
                y - 2,
                isUnlocked ? achievement.icon : "🔒",
                {
                    fontSize: "27px"
                }
            )
                .setOrigin(0.5)
                .setDepth(21);

            const title = this.add.text(
                x,
                y + 58,
                achievement.title,
                {
                    fontSize: "10px",
                    fontStyle: "bold",
                    color: isUnlocked ? "#FDE68A" : "#64748B",
                    align: "center",
                    wordWrap: {
                        width: 125,
                        useAdvancedWrap: true
                    }
                }
            )
                .setOrigin(0.5, 0)
                .setDepth(21);

            if (isUnlocked) {
                this.tweens.add({
                    targets: [circle, icon],
                    scaleX: 1.06,
                    scaleY: 1.06,
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
            }
        });
    }

    createPanel(x, y, width, height, borderColor) {
        const shadow = this.add.rectangle(
            x + 7,
            y + 8,
            width,
            height,
            0x000000,
            0.38
        ).setDepth(18);

        const panel = this.add.rectangle(
            x,
            y,
            width,
            height,
            0x07111f,
            0.88
        )
            .setStrokeStyle(2, borderColor, 0.6)
            .setDepth(19);

        return { shadow, panel };
    }

    createBackButton(width, height) {
        const button = this.add.text(
            38,
            height - 42,
            "← BACK",
            {
                fontSize: "22px",
                fontStyle: "bold",
                color: "#FFFFFF",
                backgroundColor: "#0F172A",
                padding: {
                    left: 18,
                    right: 18,
                    top: 10,
                    bottom: 10
                },
                stroke: "#020617",
                strokeThickness: 4
            }
        )
            .setOrigin(0, 1)
            .setDepth(30)
            .setInteractive({ useHandCursor: true });

        button.on("pointerover", () => {
            button.setColor("#7DD3FC");
            button.setScale(1.05);
        });

        button.on("pointerout", () => {
            button.setColor("#FFFFFF");
            button.setScale(1);
        });

        button.on("pointerdown", () => {
            this.scene.start("MenuScene");
        });

        this.input.keyboard.once("keydown-ESC", () => {
            this.scene.start("MenuScene");
        });
    }

    createStars(width, height) {
        for (let i = 0; i < 70; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(0.6, 1.8),
                0xffffff,
                Phaser.Math.FloatBetween(0.15, 0.5)
            ).setDepth(2);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.05, 0.7),
                duration: Phaser.Math.Between(900, 2400),
                yoyo: true,
                repeat: -1
            });
        }
    }
}