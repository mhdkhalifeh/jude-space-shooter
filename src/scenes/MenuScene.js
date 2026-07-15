import Phaser from "phaser";
import SoundManager from "../managers/SoundManager.js";
import SaveManager from "../managers/SaveManager.js";
import XPManager from "../managers/XPManager.js";
import { UITheme, addSciFiPanel } from "../theme/UITheme.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        const { width, height } = this.scale;

        this.soundManager = new SoundManager(this);
        this.saveManager = new SaveManager(this);
        this.xpManager = new XPManager(this);

        this.fullscreenPromptOpen = false;

        this.cameras.main.setBackgroundColor("#020617");

        this.add
            .image(width / 2, height / 2, "background_space")
            .setDisplaySize(width, height);

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x020617,
            0.48
        );

        this.createStars(width, height);
        this.createHeroShip(width, height);
        this.createBrand(width);
        this.createCommandPanel(width, height);
        this.createPlayerStrip(width, height);

        this.soundManager.playMusic("menu_music", 0.35);
    }

    isMobileDevice() {
        return (
            this.sys.game.device.input.touch ||
            window.matchMedia("(pointer: coarse)").matches ||
            window.innerWidth <= 900
        );
    }

    isFullscreenActive() {
        return Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }

    async requestGameFullscreen() {
        const target =
            document.getElementById("game") ||
            this.game.canvas;

        if (!target) return false;

        try {
            if (target.requestFullscreen) {
                await target.requestFullscreen({
                    navigationUI: "hide"
                });

                return true;
            }

            if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
                return true;
            }

            if (target.msRequestFullscreen) {
                target.msRequestFullscreen();
                return true;
            }
        } catch (error) {
            console.warn(
                "Browser fullscreen request failed:",
                error
            );
        }

        return false;
    }

    async enterFullscreenAndPlay() {
        this.soundManager.sfx("button", 0.5);

        if (
            this.isMobileDevice() &&
            !this.isFullscreenActive()
        ) {
            await this.requestGameFullscreen();
        }

        this.startNewGame();
    }

    showFullscreenPrompt() {
        if (this.fullscreenPromptOpen) return;

        this.fullscreenPromptOpen = true;

        const { width, height } = this.scale;

        const overlay = this.add
            .rectangle(
                width / 2,
                height / 2,
                width,
                height,
                0x020617,
                0.9
            )
            .setDepth(3000)
            .setInteractive();

        const panelWidth = Math.min(
            620,
            width - 80
        );

        const panelHeight = Math.min(
            360,
            height - 80
        );

        const panel = this.add
            .rectangle(
                width / 2,
                height / 2,
                panelWidth,
                panelHeight,
                0x0f172a,
                0.98
            )
            .setStrokeStyle(
                3,
                0x38bdf8,
                0.95
            )
            .setDepth(3001);

        const title = this.add
            .text(
                width / 2,
                height / 2 - 105,
                "FULL SCREEN",
                {
                    ...UITheme.text.title,
                    fontSize: "42px",
                    color: "#38BDF8",
                    stroke: "#020617",
                    strokeThickness: 7
                }
            )
            .setOrigin(0.5)
            .setDepth(3002);

        const message = this.add
            .text(
                width / 2,
                height / 2 - 38,
                "For the best mobile experience,\nplay in landscape full screen.",
                {
                    ...UITheme.text.body,
                    fontSize: "21px",
                    color: "#E2E8F0",
                    align: "center",
                    lineSpacing: 8,
                    stroke: "#020617",
                    strokeThickness: 4
                }
            )
            .setOrigin(0.5)
            .setDepth(3002);

        let enterButton;
        let skipButton;

        enterButton = this.createPromptButton(
            width / 2,
            height / 2 + 55,
            "ENTER FULLSCREEN",
            "#22C55E",
            async () => {
                /*
                 * مهم:
                 * طلب الـ Fullscreen يحدث مباشرة داخل pointerdown.
                 * لا نستخدم delayedCall قبل الطلب.
                 */
                await this.requestGameFullscreen();

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

        skipButton = this.createPromptButton(
            width / 2,
            height / 2 + 125,
            "PLAY WITHOUT FULLSCREEN",
            "#94A3B8",
            () => {
                this.soundManager.sfx(
                    "button",
                    0.4
                );

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
            alpha: {
                from: 0,
                to: 1
            },
            scaleX: {
                from: 0.94,
                to: 1
            },
            scaleY: {
                from: 0.94,
                to: 1
            },
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

    createPromptButton(
        x,
        y,
        text,
        color,
        callback
    ) {
        const button = this.add
            .text(
                x,
                y,
                text,
                {
                    ...UITheme.text.title,
                    fontSize: "24px",
                    color,
                    backgroundColor: "#111827",
                    padding: {
                        left: 24,
                        right: 24,
                        top: 12,
                        bottom: 12
                    },
                    stroke: "#020617",
                    strokeThickness: 5
                }
            )
            .setOrigin(0.5)
            .setDepth(3003)
            .setInteractive({
                useHandCursor: true
            });

        button.on("pointerover", () => {
            button.setScale(1.05);
            button.setColor("#FACC15");
        });

        button.on("pointerout", () => {
            button.setScale(1);
            button.setColor(color);
        });

        button.on("pointerdown", callback);

        return button;
    }

    createBrand(width) {
        this.add.text(
            70,
            72,
            "JUDE",
            {
                ...UITheme.text.title,
                fontSize: "76px",
                color: "#38BDF8",
                letterSpacing: 4
            }
        );

        this.add.text(
            74,
            145,
            "SPACE SHOOTER",
            {
                ...UITheme.text.mono,
                fontSize: "25px",
                color: "#E2E8F0",
                letterSpacing: 6
            }
        );

        this.add.text(
            76,
            185,
            "FLEET COMMAND // VERSION 1.0 DEVELOPMENT",
            {
                ...UITheme.text.body,
                fontSize: "13px",
                color: "#64748B",
                letterSpacing: 2
            }
        );
    }

    createCommandPanel(width, height) {
        const x = width * 0.72;
        const y = height * 0.49;

        const panel = addSciFiPanel(
            this,
            x,
            y,
            430,
            470,
            {
                color: UITheme.colors.cyan,
                alpha: 0.9,
                depth: 20
            }
        );

        const title = this.add
            .text(
                0,
                -190,
                "COMMAND DECK",
                {
                    ...UITheme.text.mono,
                    fontSize: "16px",
                    color: "#7DD3FC",
                    letterSpacing: 3
                }
            )
            .setOrigin(0.5);

        panel.add(title);

        const buttons = [
            [
                "PLAY",
                "BEGIN NEW SORTIE",
                () => {
                    if (
                        this.isMobileDevice() &&
                        !this.isFullscreenActive()
                    ) {
                        this.showFullscreenPrompt();
                        return;
                    }

                    this.soundManager.sfx(
                        "button",
                        0.5
                    );

                    this.startNewGame();
                },
                0x22c55e
            ],
            [
                "HANGAR",
                "SHIPS // LOADOUT",
                () => this.openScene("HangarScene"),
                0x38bdf8
            ],
            [
                "PROFILE",
                "LEVEL // RECORDS",
                () => this.openScene("ProfileScene"),
                0xa78bfa
            ],
            [
                "INFORMATION",
                "SYSTEM // CREDITS",
                () => this.openScene("InfoScene"),
                0x64748b
            ]
        ];

        buttons.forEach(
            (item, index) => {
                const btn =
                    this.createMenuButton(
                        0,
                        -112 + index * 88,
                        340,
                        68,
                        ...item
                    );

                panel.add(btn);
            }
        );
    }

    createMenuButton(
        x,
        y,
        width,
        height,
        title,
        subtitle,
        callback,
        accent
    ) {
        const c = this.add
            .container(x, y)
            .setSize(width, height);

        const bg = this.add
            .rectangle(
                0,
                0,
                width,
                height,
                0x0b1728,
                0.95
            )
            .setStrokeStyle(
                1,
                accent,
                0.7
            );

        const line = this.add.rectangle(
            -width / 2 + 4,
            0,
            5,
            height - 10,
            accent,
            0.95
        );

        const t = this.add
            .text(
                -width / 2 + 30,
                -12,
                title,
                {
                    ...UITheme.text.title,
                    fontSize: "22px",
                    color: "#FFFFFF",
                    strokeThickness: 4
                }
            )
            .setOrigin(0, 0.5);

        const s = this.add
            .text(
                -width / 2 + 31,
                15,
                subtitle,
                {
                    ...UITheme.text.mono,
                    fontSize: "10px",
                    color: "#94A3B8",
                    letterSpacing: 2
                }
            )
            .setOrigin(0, 0.5);

        const arrow = this.add
            .text(
                width / 2 - 28,
                0,
                "›",
                {
                    fontFamily:
                        UITheme.fonts.title,
                    fontSize: "34px",
                    color: "#7DD3FC"
                }
            )
            .setOrigin(0.5);

        c.add([
            bg,
            line,
            t,
            s,
            arrow
        ]);

        c.setInteractive({
            useHandCursor: true
        });

        c.on("pointerover", () => {
            bg.setFillStyle(
                0x10233b,
                1
            );

            c.setScale(1.025);
            arrow.setColor("#FACC15");
        });

        c.on("pointerout", () => {
            bg.setFillStyle(
                0x0b1728,
                0.95
            );

            c.setScale(1);
            arrow.setColor("#7DD3FC");
        });

        c.on("pointerdown", () => {
            callback();
        });

        return c;
    }

    createPlayerStrip(width, height) {
        const xp =
            this.xpManager.getProfileData();

        const credits =
            this.saveManager.getCredits();

        const ship =
            this.saveManager
                .getSelectedShip()
                .toUpperCase();

        const panel = addSciFiPanel(
            this,
            width / 2,
            height - 55,
            width - 120,
            70,
            {
                color:
                    UITheme.colors.purple,
                alpha: 0.82,
                depth: 20
            }
        );

        const items = [
            [
                `LV ${xp.level}`,
                "PILOT LEVEL",
                "#FACC15"
            ],
            [
                `◈ ${credits.toLocaleString(
                    "en-US"
                )}`,
                "CREDITS",
                "#7DD3FC"
            ],
            [
                ship,
                "ACTIVE SHIP",
                "#C4B5FD"
            ],
            [
                String(
                    this.saveManager
                        .getHighScore()
                ).padStart(6, "0"),
                "HIGH SCORE",
                "#86EFAC"
            ]
        ];

        items.forEach(
            (item, index) => {
                const x =
                    -panel.width / 2 +
                    120 +
                    index *
                        ((width - 180) /
                            4);

                panel.add(
                    this.add
                        .text(
                            x,
                            -8,
                            item[0],
                            {
                                ...UITheme.text
                                    .mono,
                                fontSize:
                                    "18px",
                                color:
                                    item[2]
                            }
                        )
                        .setOrigin(0.5)
                );

                panel.add(
                    this.add
                        .text(
                            x,
                            16,
                            item[1],
                            {
                                ...UITheme.text
                                    .body,
                                fontSize:
                                    "10px",
                                color:
                                    "#64748B",
                                letterSpacing:
                                    2
                            }
                        )
                        .setOrigin(0.5)
                );
            }
        );
    }

    createHeroShip(width, height) {
        const glow = this.add.ellipse(
            width * 0.32,
            height * 0.54,
            450,
            450,
            0x38bdf8,
            0.045
        );

        const ship = this.add
            .image(
                width * 0.32,
                height * 0.53,
                "player"
            )
            .setScale(0.34)
            .setDepth(10);

        this.add.ellipse(
            width * 0.32,
            height * 0.76,
            310,
            56,
            0x000000,
            0.45
        );

        this.tweens.add({
            targets: ship,
            y: ship.y - 16,
            angle: {
                from: -3,
                to: 3
            },
            duration: 2100,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.tweens.add({
            targets: glow,
            scaleX: 1.12,
            scaleY: 1.12,
            alpha: 0.08,
            duration: 1600,
            yoyo: true,
            repeat: -1
        });
    }

    createStars(width, height) {
        for (let i = 0; i < 65; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(
                    0,
                    width
                ),
                Phaser.Math.Between(
                    0,
                    height
                ),
                Phaser.Math.FloatBetween(
                    0.6,
                    1.8
                ),
                0xffffff,
                Phaser.Math.FloatBetween(
                    0.1,
                    0.55
                )
            );

            this.tweens.add({
                targets: star,
                alpha:
                    Phaser.Math.FloatBetween(
                        0.05,
                        0.75
                    ),
                duration:
                    Phaser.Math.Between(
                        1000,
                        2600
                    ),
                yoyo: true,
                repeat: -1
            });
        }
    }

    startNewGame() {
        this.soundManager.stopMusic();

        this.registry.set(
            "currentStage",
            1
        );

        this.registry.set(
            "checkpointStage",
            1
        );

        this.registry.set(
            "checkpointWave",
            1
        );

        this.registry.set(
            "checkpointScore",
            0
        );

        this.scene.start(
            "GameScene"
        );
    }

    openScene(key) {
        this.soundManager.sfx(
            "button",
            0.45
        );

        this.scene.start(key);
    }
}