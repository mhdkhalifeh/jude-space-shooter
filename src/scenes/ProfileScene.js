import Phaser from "phaser";
import SaveManager from "../managers/SaveManager";
import AchievementManager from "../managers/AchievementManager";
import XPManager from "../managers/XPManager";

export default class ProfileScene extends Phaser.Scene {
    constructor() {
        super("ProfileScene");
    }

    create() {
        const { width, height } = this.scale;

        this.saveManager = new SaveManager(this);
        this.achievementManager = new AchievementManager(this);
        this.xpManager = new XPManager(this);

        this.stats = this.saveManager.getStats();
        this.profile = this.xpManager.getProfileData();

        this.cameras.main.setBackgroundColor("#020617");
        this.createBackground(width, height);
        this.createTopBar(width);
        this.createDashboard(width, height);
        this.createBackButton(height);

        this.escKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.escHandler = () => this.goBack();
        this.escKey.on("down", this.escHandler);

        this.events.once("shutdown", () => {
            this.escKey?.off("down", this.escHandler);
        });
    }

    createBackground(width, height) {
        if (this.textures.exists("background_space")) {
            this.add.image(width / 2, height / 2, "background_space")
                .setDisplaySize(width, height)
                .setAlpha(0.58)
                .setDepth(0);
        }

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x020617,
            0.68
        ).setDepth(1);

        this.add.rectangle(
            width * 0.18,
            height / 2,
            width * 0.36,
            height,
            0x07111f,
            0.28
        ).setDepth(2);

        this.add.rectangle(
            width * 0.82,
            height / 2,
            width * 0.36,
            height,
            0x0b1023,
            0.2
        ).setDepth(2);

        const vignette = this.add.graphics().setDepth(3);
        vignette.fillGradientStyle(
            0x020617,
            0x020617,
            0x020617,
            0x020617,
            0.78,
            0.78,
            0.08,
            0.08
        );
        vignette.fillRect(0, 0, width, height);

        this.createStars(width, height);
    }

    createTopBar(width) {
        const barHeight = 108;

        this.add.rectangle(
            width / 2,
            barHeight / 2,
            width,
            barHeight,
            0x050b16,
            0.9
        )
            .setStrokeStyle(1, 0x1e3a5f, 0.9)
            .setDepth(10);

        this.add.rectangle(
            5,
            barHeight / 2,
            4,
            barHeight - 26,
            0x38bdf8,
            1
        ).setDepth(11);

        this.add.text(
            42,
            31,
            "JUDE // PILOT DATABASE",
            {
                fontSize: "13px",
                fontStyle: "bold",
                color: "#64748B",
                letterSpacing: 3
            }
        )
            .setOrigin(0, 0.5)
            .setDepth(12);

        this.add.text(
            40,
            68,
            "PLAYER PROFILE",
            {
                fontSize: "35px",
                fontStyle: "bold",
                color: "#EAF8FF",
                stroke: "#020617",
                strokeThickness: 5,
                letterSpacing: 1
            }
        )
            .setOrigin(0, 0.5)
            .setDepth(12);

        this.add.text(
            width - 42,
            39,
            "JUDE SPACE SHOOTER",
            {
                fontSize: "15px",
                fontStyle: "bold",
                color: "#38BDF8",
                letterSpacing: 3
            }
        )
            .setOrigin(1, 0.5)
            .setDepth(12);

        this.add.text(
            width - 42,
            70,
            "COMBAT RECORD // VERIFIED",
            {
                fontSize: "11px",
                fontStyle: "bold",
                color: "#475569",
                letterSpacing: 2
            }
        )
            .setOrigin(1, 0.5)
            .setDepth(12);
    }

    createDashboard(width, height) {
        const margin = Math.max(26, Math.min(48, width * 0.025));
        const gap = Math.max(16, Math.min(24, width * 0.014));
        const top = 128;
        const bottom = height - 92;
        const availableHeight = bottom - top;
        const achievementsHeight = Math.max(
            144,
            Math.min(178, availableHeight * 0.24)
        );
        const upperHeight = availableHeight - achievementsHeight - gap;
        const contentWidth = width - margin * 2;
        const leftWidth = Math.max(
            330,
            Math.min(450, contentWidth * 0.31)
        );
        const rightWidth = contentWidth - leftWidth - gap;

        const leftX = margin + leftWidth / 2;
        const rightX = margin + leftWidth + gap + rightWidth / 2;
        const upperY = top + upperHeight / 2;

        this.createPilotCard(
            leftX,
            upperY,
            leftWidth,
            upperHeight
        );

        this.createCombatCard(
            rightX,
            upperY,
            rightWidth,
            upperHeight
        );

        this.createAchievements(
            width / 2,
            top + upperHeight + gap + achievementsHeight / 2,
            contentWidth,
            achievementsHeight
        );
    }

    createPilotCard(x, y, width, height) {
        this.createPanel(x, y, width, height, 0x38bdf8);

        const left = x - width / 2;
        const top = y - height / 2;
        const pad = Math.max(22, width * 0.065);

        this.createSectionHeader(
            left + pad,
            top + 30,
            "PILOT DOSSIER",
            "01",
            "#38BDF8"
        );

        this.add.text(
            x,
            top + height * 0.22,
            `LEVEL ${this.profile.level}`,
            {
                fontSize: `${Math.max(31, Math.min(46, width * 0.1))}px`,
                fontStyle: "bold",
                color: "#FACC15",
                stroke: "#020617",
                strokeThickness: 6
            }
        )
            .setOrigin(0.5)
            .setDepth(22);

        this.add.text(
            x,
            top + height * 0.31,
            "CURRENT PILOT RANK",
            {
                fontSize: "11px",
                fontStyle: "bold",
                color: "#64748B",
                letterSpacing: 3
            }
        )
            .setOrigin(0.5)
            .setDepth(22);

        const barWidth = width - pad * 2;
        const barY = top + height * 0.39;
        const progress = Phaser.Math.Clamp(
            Number(this.profile.progress) || 0,
            0,
            1
        );

        this.add.rectangle(
            left + pad,
            barY,
            barWidth,
            12,
            0x0f172a,
            1
        )
            .setOrigin(0, 0.5)
            .setStrokeStyle(1, 0x334155, 1)
            .setDepth(22);

        this.add.rectangle(
            left + pad,
            barY,
            Math.max(3, barWidth * progress),
            12,
            0xfacc15,
            1
        )
            .setOrigin(0, 0.5)
            .setDepth(23);

        this.add.text(
            left + pad,
            barY + 20,
            `${this.profile.currentXP} XP`,
            {
                fontSize: "11px",
                fontStyle: "bold",
                color: "#FDE68A"
            }
        )
            .setOrigin(0, 0)
            .setDepth(23);

        this.add.text(
            left + width - pad,
            barY + 20,
            `${this.profile.requiredXP} XP`,
            {
                fontSize: "11px",
                fontStyle: "bold",
                color: "#64748B"
            }
        )
            .setOrigin(1, 0)
            .setDepth(23);

        const summaryTop = top + height * 0.53;
        const summaryHeight = height * 0.37;
        const rowGap = summaryHeight / 4;

        const items = [
            [
                "HIGH SCORE",
                Number(this.stats.highScore || 0).toLocaleString("en-US"),
                "#7DD3FC"
            ],
            [
                "HIGHEST SECTOR",
                `${this.stats.highestStage || 1} / ${this.stats.highestWave || 1}`,
                "#C4B5FD"
            ],
            [
                "TOTAL RUNS",
                String(this.stats.totalRuns || 0),
                "#86EFAC"
            ],
            [
                "FLIGHT TIME",
                this.saveManager.getPlayTimeFormatted(),
                "#FCA5A5"
            ]
        ];

        items.forEach((item, index) => {
            const rowY = summaryTop + rowGap * index;

            if (index > 0) {
                this.add.rectangle(
                    x,
                    rowY - rowGap / 2,
                    width - pad * 2,
                    1,
                    0x1e293b,
                    0.85
                ).setDepth(21);
            }

            this.add.text(
                left + pad,
                rowY,
                item[0],
                {
                    fontSize: "12px",
                    fontStyle: "bold",
                    color: "#94A3B8",
                    letterSpacing: 1
                }
            )
                .setOrigin(0, 0.5)
                .setDepth(22);

            this.add.text(
                left + width - pad,
                rowY,
                item[1],
                {
                    fontSize: "21px",
                    fontStyle: "bold",
                    color: item[2]
                }
            )
                .setOrigin(1, 0.5)
                .setDepth(22);
        });
    }

    createCombatCard(x, y, width, height) {
        this.createPanel(x, y, width, height, 0xa78bfa);

        const left = x - width / 2;
        const top = y - height / 2;
        const pad = Math.max(22, Math.min(32, width * 0.035));

        this.createSectionHeader(
            left + pad,
            top + 30,
            "COMBAT TELEMETRY",
            "02",
            "#C4B5FD"
        );

        const bossHeight = Math.max(112, height * 0.25);
        const statsTop = top + 62;
        const statsBottom = top + height - bossHeight - 18;
        const statsHeight = statsBottom - statsTop;
        const statsGap = 12;
        const statWidth = (width - pad * 2 - statsGap) / 2;

        const leftStats = [
            ["ENEMIES DESTROYED", this.stats.enemiesKilled || 0],
            ["ELITE ENEMIES", this.stats.eliteEnemiesKilled || 0],
            ["BOSSES DEFEATED", this.stats.bossesKilled || 0],
            ["SHOTS FIRED", this.stats.shotsFired || 0]
        ];

        const rightStats = [
            ["POWER-UPS COLLECTED", this.stats.powerUpsCollected || 0],
            ["SHIELDS COLLECTED", this.stats.shieldsCollected || 0],
            ["DOUBLE LASERS", this.stats.doubleLasersCollected || 0],
            ["DAMAGE TAKEN", this.stats.damageTaken || 0]
        ];

        this.createStatGrid(
            left + pad,
            statsTop,
            statWidth,
            statsHeight,
            leftStats,
            0x38bdf8
        );

        this.createStatGrid(
            left + pad + statWidth + statsGap,
            statsTop,
            statWidth,
            statsHeight,
            rightStats,
            0xa78bfa
        );

        const bossTop = statsBottom + 12;
        this.createBossRecord(
            left + pad,
            bossTop,
            width - pad * 2,
            top + height - 16 - bossTop
        );
    }

    createStatGrid(x, y, width, height, data, accentColor) {
        const rowGap = 8;
        const rowHeight = (height - rowGap * 3) / 4;

        data.forEach((item, index) => {
            const rowY = y + index * (rowHeight + rowGap);

            this.add.rectangle(
                x,
                rowY,
                width,
                rowHeight,
                0x0b1422,
                0.9
            )
                .setOrigin(0, 0)
                .setStrokeStyle(1, 0x243447, 0.8)
                .setDepth(21);

            this.add.rectangle(
                x,
                rowY,
                3,
                rowHeight,
                accentColor,
                0.9
            )
                .setOrigin(0, 0)
                .setDepth(22);

            this.add.text(
                x + 16,
                rowY + rowHeight / 2,
                item[0],
                {
                    fontSize: `${Math.max(10, Math.min(13, width * 0.038))}px`,
                    fontStyle: "bold",
                    color: "#94A3B8"
                }
            )
                .setOrigin(0, 0.5)
                .setDepth(22);

            this.add.text(
                x + width - 15,
                rowY + rowHeight / 2,
                Number(item[1]).toLocaleString("en-US"),
                {
                    fontSize: `${Math.max(16, Math.min(21, rowHeight * 0.48))}px`,
                    fontStyle: "bold",
                    color: "#F8FAFC"
                }
            )
                .setOrigin(1, 0.5)
                .setDepth(22);
        });
    }

    createBossRecord(x, y, width, height) {
        this.add.rectangle(
            x,
            y,
            width,
            height,
            0x0a101d,
            0.92
        )
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x3f1d2e, 1)
            .setDepth(21);

        this.add.text(
            x + 16,
            y + 17,
            "BOSS RECORD",
            {
                fontSize: "11px",
                fontStyle: "bold",
                color: "#FCA5A5",
                letterSpacing: 2
            }
        )
            .setOrigin(0, 0.5)
            .setDepth(22);

        const bosses = [
            ["ALPHA", this.stats.bosses?.alpha || 0, "#FF7B7B"],
            ["OMEGA", this.stats.bosses?.omega || 0, "#C4B5FD"],
            ["LEVIATHAN", this.stats.bosses?.leviathan || 0, "#86EFAC"]
        ];

        const startX = x + width * 0.37;
        const usableWidth = width * 0.59;

        bosses.forEach((boss, index) => {
            const bossX =
                startX +
                (usableWidth / bosses.length) * index +
                usableWidth / bosses.length / 2;

            this.add.text(
                bossX,
                y + height * 0.36,
                boss[0],
                {
                    fontSize: "11px",
                    fontStyle: "bold",
                    color: boss[2],
                    letterSpacing: 1
                }
            )
                .setOrigin(0.5)
                .setDepth(22);

            this.add.text(
                bossX,
                y + height * 0.68,
                String(boss[1]),
                {
                    fontSize: `${Math.max(20, Math.min(28, height * 0.28))}px`,
                    fontStyle: "bold",
                    color: "#FFFFFF"
                }
            )
                .setOrigin(0.5)
                .setDepth(22);
        });
    }

    createAchievements(x, y, width, height) {
        this.createPanel(x, y, width, height, 0xfacc15);

        const definitions =
            this.achievementManager.getDefinitions() || [];
        const unlocked =
            this.saveManager.getUnlockedAchievements() || [];
        const unlockedIds =
            new Set(unlocked.map((item) => item.id));
        const visibleAchievements = definitions.slice(0, 7);
        const left = x - width / 2;
        const top = y - height / 2;
        const pad = 22;

        this.createSectionHeader(
            left + pad,
            top + 25,
            `ACHIEVEMENTS  ${unlocked.length}/${definitions.length}`,
            "03",
            "#FACC15"
        );

        if (visibleAchievements.length === 0) {
            this.add.text(
                x,
                y + 12,
                "NO ACHIEVEMENTS AVAILABLE",
                {
                    fontSize: "13px",
                    fontStyle: "bold",
                    color: "#64748B",
                    letterSpacing: 2
                }
            )
                .setOrigin(0.5)
                .setDepth(22);
            return;
        }

        const cardGap = 10;
        const cardTop = top + 52;
        const cardHeight = height - 65;
        const cardWidth =
            (width - pad * 2 - cardGap * (visibleAchievements.length - 1)) /
            visibleAchievements.length;

        visibleAchievements.forEach((achievement, index) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const cardX =
                left + pad + index * (cardWidth + cardGap);

            this.add.rectangle(
                cardX,
                cardTop,
                cardWidth,
                cardHeight,
                isUnlocked ? 0x1a170a : 0x0b1220,
                0.94
            )
                .setOrigin(0, 0)
                .setStrokeStyle(
                    1,
                    isUnlocked ? 0xfacc15 : 0x26364a,
                    isUnlocked ? 0.95 : 0.8
                )
                .setDepth(21);

            const iconY = cardTop + cardHeight * 0.38;
            const iconRadius = Math.max(
                18,
                Math.min(27, cardHeight * 0.25)
            );

            const badge = this.add.circle(
                cardX + cardWidth / 2,
                iconY,
                iconRadius,
                isUnlocked ? 0x302408 : 0x111827,
                1
            )
                .setStrokeStyle(
                    2,
                    isUnlocked ? 0xfacc15 : 0x334155,
                    1
                )
                .setDepth(22);

            const icon = this.add.text(
                cardX + cardWidth / 2,
                iconY,
                isUnlocked ? achievement.icon : "◆",
                {
                    fontSize: `${Math.max(16, iconRadius * 0.9)}px`,
                    color: isUnlocked ? "#FFFFFF" : "#475569"
                }
            )
                .setOrigin(0.5)
                .setDepth(23);

            this.add.text(
                cardX + cardWidth / 2,
                cardTop + cardHeight * 0.78,
                achievement.title,
                {
                    fontSize: `${Math.max(8, Math.min(11, cardWidth * 0.075))}px`,
                    fontStyle: "bold",
                    color: isUnlocked ? "#FDE68A" : "#64748B",
                    align: "center",
                    wordWrap: {
                        width: Math.max(60, cardWidth - 12),
                        useAdvancedWrap: true
                    }
                }
            )
                .setOrigin(0.5)
                .setDepth(23);

            if (isUnlocked) {
                this.tweens.add({
                    targets: [badge, icon],
                    alpha: { from: 0.72, to: 1 },
                    duration: 1100 + index * 80,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                });
            }
        });
    }

    createSectionHeader(x, y, label, number, color) {
        this.add.text(
            x,
            y,
            number,
            {
                fontSize: "10px",
                fontStyle: "bold",
                color,
                backgroundColor: "#0F172A",
                padding: {
                    left: 7,
                    right: 7,
                    top: 4,
                    bottom: 4
                }
            }
        )
            .setOrigin(0, 0.5)
            .setDepth(23);

        this.add.text(
            x + 40,
            y,
            label,
            {
                fontSize: "13px",
                fontStyle: "bold",
                color: "#E2E8F0",
                letterSpacing: 2
            }
        )
            .setOrigin(0, 0.5)
            .setDepth(23);
    }

    createPanel(x, y, width, height, borderColor) {
        this.add.rectangle(
            x + 6,
            y + 7,
            width,
            height,
            0x000000,
            0.42
        ).setDepth(18);

        this.add.rectangle(
            x,
            y,
            width,
            height,
            0x07111f,
            0.93
        )
            .setStrokeStyle(1, borderColor, 0.65)
            .setDepth(19);

        this.add.rectangle(
            x - width / 2,
            y - height / 2,
            4,
            Math.min(54, height * 0.3),
            borderColor,
            1
        )
            .setOrigin(0, 0)
            .setDepth(20);
    }

    createBackButton(height) {
        const button = this.add.container(40, height - 48)
            .setDepth(40)
            .setSize(150, 46)
            .setInteractive({ useHandCursor: true });

        const bg = this.add.rectangle(
            0,
            0,
            150,
            46,
            0x0b1422,
            0.96
        ).setStrokeStyle(1, 0x38bdf8, 0.8);

        const accent = this.add.rectangle(
            -75,
            0,
            4,
            46,
            0x38bdf8,
            1
        ).setOrigin(0, 0.5);

        const text = this.add.text(
            0,
            0,
            "←  BACK",
            {
                fontSize: "17px",
                fontStyle: "bold",
                color: "#EAF8FF",
                letterSpacing: 1
            }
        ).setOrigin(0.5);

        button.add([bg, accent, text]);

        button.on("pointerover", () => {
            bg.setFillStyle(0x10263a, 1);
            bg.setStrokeStyle(1, 0x7dd3fc, 1);
            text.setColor("#7DD3FC");
        });

        button.on("pointerout", () => {
            bg.setFillStyle(0x0b1422, 0.96);
            bg.setStrokeStyle(1, 0x38bdf8, 0.8);
            text.setColor("#EAF8FF");
        });

        button.on("pointerdown", () => {
            this.soundManager?.sfx?.("button", 0.4);
            this.goBack();
        });
    }

    goBack() {
        if (this.scene.isActive("ProfileScene")) {
            this.scene.start("MenuScene");
        }
    }

    createStars(width, height) {
        const starCount = Math.max(
            36,
            Math.min(75, Math.round((width * height) / 26000))
        );

        for (let i = 0; i < starCount; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(112, height),
                Phaser.Math.FloatBetween(0.5, 1.5),
                0xffffff,
                Phaser.Math.FloatBetween(0.1, 0.38)
            ).setDepth(4);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.04, 0.55),
                duration: Phaser.Math.Between(1100, 2600),
                yoyo: true,
                repeat: -1
            });
        }
    }
}