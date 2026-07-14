import Phaser from "phaser";
import SoundManager from "../managers/SoundManager.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.soundManager = new SoundManager(this);
        this.fullscreenPromptOpen = false;

        this.cameras.main.setBackgroundColor("#020617");

        this.add.image(w / 2, h / 2, "background_space")
            .setDisplaySize(w, h);

        this.add.rectangle(w / 2, h / 2, w, h, 0x020617, 0.28);

        this.createStars(w, h);
        this.createMenuShip(w, h);
        this.createBackgroundWar(w, h);
        this.showTitle(w, h);
        this.showButtons(w, h);

        this.soundManager.playMusic("menu_music", 0.35);
    }

    isMobileDevice() {
        return (
            this.sys.game.device.input.touch ||
            window.innerWidth <= 900
        );
    }

    startNewGame() {
        this.soundManager.stopMusic();

        this.registry.set("currentStage", 1);
        this.registry.set("checkpointStage", 1);
        this.registry.set("checkpointWave", 1);
        this.registry.set("checkpointScore", 0);

        this.scene.start("GameScene");
    }

    openProfile() {
        this.soundManager.sfx("button", 0.5);
        this.scene.start("ProfileScene");
    }

    showFullscreenPrompt() {
        if (this.fullscreenPromptOpen) return;
        this.fullscreenPromptOpen = true;

        const w = this.scale.width;
        const h = this.scale.height;

        const overlay = this.add.rectangle(
            w / 2,
            h / 2,
            w,
            h,
            0x020617,
            0.88
        )
            .setDepth(200)
            .setInteractive();

        const panel = this.add.rectangle(
            w / 2,
            h / 2,
            620,
            360,
            0x0f172a,
            0.98
        )
            .setStrokeStyle(4, 0x38bdf8, 0.95)
            .setDepth(201);

        const title = this.add.text(
            w / 2,
            h / 2 - 115,
            "FULL SCREEN",
            {
                fontSize: "48px",
                color: "#38BDF8",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 7
            }
        )
            .setOrigin(0.5)
            .setDepth(202);

        const message = this.add.text(
            w / 2,
            h / 2 - 45,
            "For the best mobile experience,\nplay in full screen mode.",
            {
                fontSize: "25px",
                color: "#E2E8F0",
                align: "center",
                lineSpacing: 10,
                stroke: "#020617",
                strokeThickness: 4
            }
        )
            .setOrigin(0.5)
            .setDepth(202);

        let enterButton;
        let skipButton;

        enterButton = this.createPromptButton(
            w / 2,
            h / 2 + 55,
            "ENTER FULLSCREEN",
            "#22C55E",
            () => {
                this.soundManager.sfx("button", 0.5);

                const fullscreenAvailable =
                    this.sys.game.device.fullscreen?.available === true;

                if (fullscreenAvailable && !this.scale.isFullscreen) {
                    try {
                        this.scale.startFullscreen();
                    } catch (error) {
                        console.warn("Fullscreen could not start:", error);
                    }
                }

                this.destroyFullscreenPrompt(
                    overlay,
                    panel,
                    title,
                    message,
                    enterButton,
                    skipButton
                );

                this.time.delayedCall(180, () => {
                    this.startNewGame();
                });
            }
        );

        skipButton = this.createPromptButton(
            w / 2,
            h / 2 + 130,
            "SKIP",
            "#94A3B8",
            () => {
                this.soundManager.sfx("button", 0.45);

                this.destroyFullscreenPrompt(
                    overlay,
                    panel,
                    title,
                    message,
                    enterButton,
                    skipButton
                );

                this.startNewGame();
            }
        );

        this.tweens.add({
            targets: [
                panel,
                title,
                message,
                enterButton,
                skipButton
            ],
            alpha: { from: 0, to: 1 },
            scaleX: { from: 0.94, to: 1 },
            scaleY: { from: 0.94, to: 1 },
            duration: 220,
            ease: "Back.easeOut"
        });
    }

    destroyFullscreenPrompt(...objects) {
        objects.forEach((object) => {
            if (object?.active) {
                object.destroy();
            }
        });

        this.fullscreenPromptOpen = false;
    }

    createPromptButton(x, y, text, color, callback) {
        const button = this.add.text(
            x,
            y,
            text,
            {
                fontSize: "28px",
                color,
                fontStyle: "bold",
                backgroundColor: "#111827",
                padding: {
                    left: 28,
                    right: 28,
                    top: 14,
                    bottom: 14
                },
                stroke: "#020617",
                strokeThickness: 5
            }
        )
            .setOrigin(0.5)
            .setDepth(203)
            .setInteractive({ useHandCursor: true });

        button.on("pointerover", () => {
            button.setScale(1.06);
            button.setColor("#FACC15");
        });

        button.on("pointerout", () => {
            button.setScale(1);
            button.setColor(color);
        });

        button.on("pointerdown", callback);

        return button;
    }

    showTitle(w, h) {
        const jude = this.add.text(
            w / 2,
            105,
            "JUDE",
            {
                fontSize: "82px",
                color: "#38BDF8",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 9
            }
        )
            .setOrigin(0.5)
            .setDepth(20);

        const subtitle = this.add.text(
            w / 2,
            170,
            "SPACE SHOOTER",
            {
                fontSize: "42px",
                color: "#FFFFFF",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 7
            }
        )
            .setOrigin(0.5)
            .setDepth(20);

        this.tweens.add({
            targets: [jude, subtitle],
            scaleX: 1.035,
            scaleY: 1.035,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    showButtons(w, h) {
        this.createButton(
            w / 2,
            300,
            "NEW GAME",
            () => {
                this.soundManager.sfx("button", 0.5);

                if (
                    this.isMobileDevice() &&
                    !this.scale.isFullscreen
                ) {
                    this.showFullscreenPrompt();
                    return;
                }

                this.startNewGame();
            }
        );

        this.createButton(
            w / 2,
            375,
            "PLAYER PROFILE",
            () => {
                this.openProfile();
            },
            "#38BDF8"
        );

        this.createButton(
            w / 2,
            450,
            "INFORMATION",
            () => {
                this.soundManager.sfx("button", 0.5);
                this.scene.start("InfoScene");
            },
            "#A78BFA"
        );

        this.add.text(
            w / 2,
            h - 55,
            "Version Beta 1.0\n© 2026 JUDE PLAY",
            {
                fontSize: "20px",
                color: "#94A3B8",
                align: "center",
                stroke: "#020617",
                strokeThickness: 3
            }
        )
            .setOrigin(0.5)
            .setDepth(20);
    }

    createButton(
        x,
        y,
        text,
        callback,
        baseColor = "#22C55E"
    ) {
        const btn = this.add.text(
            x,
            y,
            text,
            {
                fontSize: "34px",
                color: baseColor,
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 6
            }
        )
            .setOrigin(0.5)
            .setDepth(20)
            .setInteractive({ useHandCursor: true });

        btn.on("pointerover", () => {
            btn.setScale(1.08);
            btn.setColor("#FACC15");
        });

        btn.on("pointerout", () => {
            btn.setScale(1);
            btn.setColor(baseColor);
        });

        btn.on("pointerdown", callback);
    }

    createStars(w, h) {
        for (let i = 0; i < 90; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, w),
                Phaser.Math.Between(0, h),
                Phaser.Math.FloatBetween(0.7, 2.2),
                0xffffff,
                Phaser.Math.FloatBetween(0.22, 0.75)
            ).setDepth(1);

            this.tweens.add({
                targets: star,
                y: h + 20,
                duration: Phaser.Math.Between(6500, 15000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2500),
                onRepeat: () => {
                    star.y = -20;
                    star.x = Phaser.Math.Between(0, w);
                }
            });
        }
    }

    createMenuShip(w, h) {
        const texture =
            this.textures.exists("player")
                ? "player"
                : this.textures.exists("player_ship")
                    ? "player_ship"
                    : null;

        if (!texture) return;

        const ship = this.add.image(
            w / 2,
            h - 135,
            texture
        )
            .setScale(0.18)
            .setAlpha(0.92)
            .setDepth(15);

        this.tweens.add({
            targets: ship,
            x: w / 2 + 28,
            y: h - 145,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    createBackgroundWar(w, h) {
        this.time.addEvent({
            delay: 3200,
            loop: true,
            callback: () =>
                this.spawnBackgroundObject(w, h)
        });

        this.time.addEvent({
            delay: 2600,
            loop: true,
            callback: () =>
                this.spawnShootingStar(w, h)
        });

        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(
                i * 1600,
                () =>
                    this.spawnBackgroundObject(w, h)
            );
        }
    }

    spawnBackgroundObject(w, h) {
        const formations = [
            {
                key: "enemy_scout",
                count: 3,
                scale: 0.055,
                alpha: 0.18,
                speed: 9000
            },
            {
                key: "enemy_fighter",
                count: 2,
                scale: 0.06,
                alpha: 0.16,
                speed: 10500
            },
            {
                key: "enemy_interceptor",
                count: 2,
                scale: 0.05,
                alpha: 0.18,
                speed: 7600
            },
            {
                key: "enemy_bomber",
                count: 1,
                scale: 0.075,
                alpha: 0.14,
                speed: 13500
            },
            {
                key: "boss_alpha",
                count: 1,
                scale: 0.09,
                alpha: 0.10,
                speed: 17000
            },
            {
                key: "boss_omega",
                count: 1,
                scale: 0.085,
                alpha: 0.10,
                speed: 18000
            },
            {
                key: "boss_leviathan",
                count: 1,
                scale: 0.075,
                alpha: 0.10,
                speed: 20000
            }
        ].filter((item) =>
            this.textures.exists(item.key)
        );

        if (formations.length === 0) return;

        const picked =
            Phaser.Utils.Array.GetRandom(formations);

        const startFromLeft =
            Phaser.Math.Between(0, 1) === 0;

        const startX =
            startFromLeft ? -180 : w + 180;

        const endX =
            startFromLeft ? w + 180 : -180;

        const baseY =
            Phaser.Math.Between(80, h - 180);

        const driftY =
            Phaser.Math.Between(-90, 90);

        for (
            let i = 0;
            i < picked.count;
            i++
        ) {
            const offsetX =
                i *
                Phaser.Math.Between(55, 85);

            const offsetY =
                (i -
                    Math.floor(
                        picked.count / 2
                    )) *
                42;

            const sprite = this.add.image(
                startFromLeft
                    ? startX - offsetX
                    : startX + offsetX,
                baseY + offsetY,
                picked.key
            )
                .setScale(picked.scale)
                .setAlpha(picked.alpha)
                .setDepth(3);

            sprite.setAngle(
                startFromLeft ? 90 : -90
            );

            this.tweens.add({
                targets: sprite,
                x: endX,
                y:
                    baseY +
                    driftY +
                    offsetY,
                alpha:
                    picked.alpha * 0.65,
                duration:
                    picked.speed +
                    Phaser.Math.Between(
                        -1200,
                        1200
                    ),
                ease: "Sine.easeInOut",
                onComplete: () =>
                    sprite.destroy()
            });

            if (
                picked.key.startsWith(
                    "enemy_"
                )
            ) {
                this.time.delayedCall(
                    Phaser.Math.Between(
                        1200,
                        2600
                    ),
                    () => {
                        if (sprite.active) {
                            this.fireDistantLaser(
                                sprite,
                                startFromLeft
                            );
                        }
                    }
                );
            }
        }
    }

    fireDistantLaser(source, fromLeft) {
        const laser = this.add.rectangle(
            source.x,
            source.y + 18,
            70,
            2,
            0x22ff66,
            0.22
        ).setDepth(2);

        laser.rotation =
            fromLeft ? 0.18 : -0.18;

        this.tweens.add({
            targets: laser,
            x:
                laser.x +
                (fromLeft ? 180 : -180),
            y:
                laser.y +
                Phaser.Math.Between(
                    20,
                    70
                ),
            alpha: 0,
            duration: 900,
            onComplete: () =>
                laser.destroy()
        });
    }

    spawnShootingStar(w, h) {
        const star = this.add.circle(
            Phaser.Math.Between(0, w),
            Phaser.Math.Between(0, h / 2),
            2,
            0x93c5fd,
            0.75
        ).setDepth(3);

        this.tweens.add({
            targets: star,
            x:
                star.x +
                Phaser.Math.Between(
                    220,
                    420
                ),
            y:
                star.y +
                Phaser.Math.Between(
                    120,
                    260
                ),
            alpha: 0,
            duration:
                Phaser.Math.Between(
                    650,
                    1100
                ),
            onComplete: () =>
                star.destroy()
        });
    }

    pickWeighted(items) {
        const total = items.reduce(
            (sum, item) =>
                sum + item.weight,
            0
        );

        let roll =
            Math.random() * total;

        for (const item of items) {
            roll -= item.weight;

            if (roll <= 0) {
                return item;
            }
        }

        return items[0];
    }
}