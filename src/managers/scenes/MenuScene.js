import Phaser from "phaser";
import SoundManager from "../managers/SoundManager.js";
import SaveManager from "../managers/SaveManager.js";
import XPManager from "../managers/XPManager.js";
import { UITheme } from "../theme/UITheme.js";

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
        this.launching = false;

        this.cameras.main.setBackgroundColor("#020617");

        this.add.image(width / 2, height / 2, "background_space")
            .setDisplaySize(width, height)
            .setDepth(-30);

        this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.34)
            .setDepth(-29);

        this.createAmbientSpace(width, height);
        this.createBrand(width, height);
        this.createHangar(width, height);
        this.createSystemStatus(width, height);
        this.createCommandDeck(width, height);
        this.createPlayerDock(width, height);

        this.soundManager.playMusic("menu_music", 0.35);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.statusTimer?.remove(false);
            this.statusPulseTimer?.remove(false);
        });
    }

    createAmbientSpace(width, height) {
        const glow = this.add.ellipse(width * 0.34, height * 0.51, width * 0.67, height * 0.88, 0x0ea5e9, 0.05)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(-25);

        this.tweens.add({
            targets: glow,
            alpha: { from: 0.025, to: 0.09 },
            scaleX: { from: 0.96, to: 1.06 },
            scaleY: { from: 0.96, to: 1.06 },
            duration: 5200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        for (let i = 0; i < 58; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(0.5, 1.55),
                0xffffff,
                Phaser.Math.FloatBetween(0.08, 0.48)
            ).setDepth(-24);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.06, 0.78),
                duration: Phaser.Math.Between(1200, 3200),
                yoyo: true,
                repeat: -1
            });
        }
    }

    createBrand(width, height) {
        const logoX = width * 0.235;
        const logoY = height * 0.15;
        const scale = Math.min(width / 1280, height / 720) * 0.34;

        const logoGlow = this.add.image(logoX, logoY + 4, "jude_space_logo")
            .setScale(scale * 1.045)
            .setTint(0x38bdf8)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.2)
            .setDepth(30);

        const logo = this.add.image(logoX, logoY, "jude_space_logo")
            .setScale(scale)
            .setDepth(31);

        this.tweens.add({
            targets: logoGlow,
            alpha: { from: 0.13, to: 0.37 },
            scaleX: scale * 1.08,
            scaleY: scale * 1.08,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.add.text(logoX, height * 0.268, "FLEET COMMAND  //  V1.0", {
            ...UITheme.text.mono,
            fontSize: "11px",
            color: "#64748B",
            letterSpacing: 3
        }).setOrigin(0.5).setDepth(32);
    }

    createHangar(width, height) {
        const cx = width * 0.31;
        const floorY = height * 0.67;

        const floor = this.add.image(cx, floorY, "hangar_floor")
            .setDisplaySize(525, 360)
            .setDepth(2);

        const floorAura = this.add.ellipse(cx, floorY + 20, 420, 130, 0x0ea5e9, 0.08)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(3);

        const shadow = this.add.image(cx, floorY - 5, "hangar_shadow")
            .setDisplaySize(280, 92)
            .setAlpha(0.55)
            .setDepth(4);

        const core = this.add.image(cx, floorY - 8, "hangar_energy_core")
            .setDisplaySize(178, 178)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(5);

        const beam = this.add.image(cx, floorY - 142, "hangar_beam")
            .setDisplaySize(180, 355)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.4)
            .setDepth(6);

        const selectedShip = this.saveManager.getSelectedShip();
        const shipTexture = this.resolveShipTexture(selectedShip);
        const ship = this.add.image(cx, height * 0.46, shipTexture)
            .setScale(0.31)
            .setDepth(11);

        const shipGlow = this.add.ellipse(cx, ship.y + 45, 250, 290, 0x38bdf8, 0.055)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(8);

        const leftArm = this.add.image(cx - 190, floorY - 68, "robot_arm_left")
            .setDisplaySize(205, 205)
            .setOrigin(0.53, 0.76)
            .setAngle(-8)
            .setDepth(9);

        const rightArm = this.add.image(cx + 190, floorY - 68, "robot_arm_right")
            .setDisplaySize(205, 205)
            .setOrigin(0.47, 0.76)
            .setAngle(8)
            .setDepth(9);

        const consoleLeft = this.add.image(cx - 245, floorY + 45, "console_left")
            .setDisplaySize(175, 175)
            .setAngle(-5)
            .setDepth(10);

        const consoleRight = this.add.image(cx + 245, floorY + 45, "console_right")
            .setDisplaySize(175, 175)
            .setAngle(5)
            .setDepth(10);

        this.hangarRefs = {
            floor, floorAura, shadow, core, beam, ship, shipGlow,
            leftArm, rightArm, consoleLeft, consoleRight, cx, floorY
        };

        this.tweens.add({
            targets: core,
            angle: 360,
            duration: 8800,
            repeat: -1,
            ease: "Linear"
        });

        this.tweens.add({
            targets: [beam, floorAura],
            alpha: { from: 0.18, to: 0.54 },
            scaleX: { from: 0.94, to: 1.06 },
            duration: 1450,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.tweens.add({
            targets: [ship, shipGlow],
            y: "-=9",
            duration: 2100,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.tweens.add({
            targets: ship,
            angle: { from: -1.2, to: 1.2 },
            duration: 2800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        [consoleLeft, consoleRight].forEach((console, i) => {
            this.tweens.add({
                targets: console,
                alpha: { from: 0.78, to: 1 },
                duration: 900 + i * 180,
                yoyo: true,
                repeat: -1
            });
        });
    }

    resolveShipTexture(shipName = "player") {
        const key = String(shipName).toLowerCase();
        const map = {
            vanguard: "player",
            phantom: "ship_phantom",
            eclipse: "ship_eclipse",
            titan: "ship_titan",
            spectre: "ship_spectre",
            guardian: "ship_guardian",
            nova: "ship_nova"
        };
        return map[key] || "player";
    }

    createSystemStatus(width, height) {
        const x = width * 0.79;
        const y = height * 0.185;
        const panel = this.createGlassPanel(x, y, 430, 170, 0x38bdf8, 50);

        const title = this.add.text(0, -62, "SYSTEM STATUS", {
            ...UITheme.text.mono,
            fontSize: "16px",
            color: "#7DD3FC",
            letterSpacing: 4
        }).setOrigin(0.5);

        const divider = this.add.rectangle(0, -39, 360, 1, 0x38bdf8, 0.28);
        panel.add([title, divider]);

        const messages = [
            ["●", "INCOMING TRANSMISSION...", "#A5F3FC"],
            ["▲", "NOVA LEGION ACTIVITY DETECTED", "#FB7185"],
            ["✓", "FLEET STATUS: READY", "#86EFAC"],
            ["◎", "CURRENT SECTOR: DEEP SPACE", "#7DD3FC"]
        ];

        this.statusTexts = [];
        messages.forEach((item, index) => {
            const row = this.add.container(-168, -15 + index * 25);
            const icon = this.add.text(0, 0, item[0], {
                fontFamily: UITheme.fonts.mono,
                fontSize: "13px",
                color: item[2]
            }).setOrigin(0, 0.5);
            const text = this.add.text(24, 0, item[1], {
                ...UITheme.text.mono,
                fontSize: "11px",
                color: "#CBD5E1",
                letterSpacing: 1
            }).setOrigin(0, 0.5);
            row.add([icon, text]);
            panel.add(row);
            this.statusTexts.push({ icon, text });
        });

        let pulseIndex = 0;
        this.statusPulseTimer = this.time.addEvent({
            delay: 900,
            loop: true,
            callback: () => {
                this.statusTexts.forEach((row, index) => {
                    row.text.setAlpha(index === pulseIndex ? 1 : 0.68);
                    row.icon.setScale(index === pulseIndex ? 1.16 : 1);
                });
                pulseIndex = (pulseIndex + 1) % this.statusTexts.length;
            }
        });
    }

    createCommandDeck(width, height) {
        const x = width * 0.79;
        const y = height * 0.57;
        const panel = this.createGlassPanel(x, y, 430, 360, 0x38bdf8, 50);

        const title = this.add.text(0, -146, "COMMAND DECK", {
            ...UITheme.text.mono,
            fontSize: "18px",
            color: "#7DD3FC",
            letterSpacing: 4
        }).setOrigin(0.5);

        panel.add(title);

        const buttons = [
            ["PLAY", "BEGIN NEW SORTIE", 0x22c55e, () => this.handlePlay()],
            ["HANGAR", "SHIPS // LOADOUT", 0x38bdf8, () => this.openScene("HangarScene")],
            ["PROFILE", "LEVEL // RECORDS", 0xa78bfa, () => this.openScene("ProfileScene")],
            ["INFORMATION", "SYSTEM // CREDITS", 0x64748b, () => this.openScene("InfoScene")]
        ];

        buttons.forEach((item, index) => {
            panel.add(this.createPremiumButton(0, -82 + index * 75, 345, 60, ...item));
        });
    }

    createPremiumButton(x, y, width, height, title, subtitle, accent, callback) {
        const c = this.add.container(x, y).setSize(width, height);
        const glow = this.add.rectangle(0, 0, width + 10, height + 10, accent, 0)
            .setStrokeStyle(2, accent, 0.15);
        const bg = this.add.rectangle(0, 0, width, height, 0x071426, 0.94)
            .setStrokeStyle(1, accent, 0.7);
        const accentBar = this.add.rectangle(-width / 2 + 4, 0, 6, height - 8, accent, 1);
        const scan = this.add.rectangle(-width / 2 + 18, 0, 2, height - 12, 0xffffff, 0.28);

        const t = this.add.text(-width / 2 + 30, -10, title, {
            ...UITheme.text.title,
            fontSize: "21px",
            color: "#FFFFFF",
            stroke: "#020617",
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        const s = this.add.text(-width / 2 + 31, 15, subtitle, {
            ...UITheme.text.mono,
            fontSize: "9px",
            color: "#94A3B8",
            letterSpacing: 2
        }).setOrigin(0, 0.5);

        const arrow = this.add.text(width / 2 - 27, 0, "›", {
            fontFamily: UITheme.fonts.title,
            fontSize: "34px",
            color: "#7DD3FC"
        }).setOrigin(0.5);

        c.add([glow, bg, accentBar, scan, t, s, arrow]);
        c.setInteractive({ useHandCursor: true });

        c.on("pointerover", () => {
            this.soundManager.sfx("button", 0.22);
            bg.setFillStyle(0x0b2036, 1);
            glow.setFillStyle(accent, 0.08).setStrokeStyle(2, accent, 0.9);
            arrow.setColor("#FACC15");
            this.tweens.add({ targets: c, x: x + 8, duration: 120, ease: "Quad.easeOut" });
            this.tweens.add({ targets: scan, x: width / 2 - 18, duration: 360, ease: "Quad.easeOut" });
        });

        c.on("pointerout", () => {
            bg.setFillStyle(0x071426, 0.94);
            glow.setFillStyle(accent, 0).setStrokeStyle(2, accent, 0.15);
            arrow.setColor("#7DD3FC");
            scan.x = -width / 2 + 18;
            this.tweens.add({ targets: c, x, duration: 120 });
        });

        c.on("pointerdown", callback);
        return c;
    }

    createPlayerDock(width, height) {
        const xp = this.xpManager.getProfileData();
        const credits = this.saveManager.getCredits();
        const ship = this.saveManager.getSelectedShip().toUpperCase();
        const score = String(this.saveManager.getHighScore()).padStart(6, "0");

        const y = height - 49;
        const panel = this.createGlassPanel(width / 2, y, width - 72, 76, 0xa78bfa, 70);
        const entries = [
            ["PILOT LEVEL", `LV ${xp.level}`, "#FACC15", "✦"],
            ["CREDITS", credits.toLocaleString("en-US"), "#7DD3FC", "◆"],
            ["ACTIVE SHIP", ship, "#C4B5FD", "▲"],
            ["BEST SCORE", score, "#86EFAC", "★"]
        ];

        const spacing = (width - 150) / 4;
        entries.forEach((entry, index) => {
            const x = -panel.width / 2 + 105 + spacing * index;
            const icon = this.add.text(x - 58, 0, entry[3], {
                fontFamily: UITheme.fonts.title,
                fontSize: "23px",
                color: entry[2]
            }).setOrigin(0.5);
            const value = this.add.text(x, -6, entry[1], {
                ...UITheme.text.mono,
                fontSize: "18px",
                color: entry[2]
            }).setOrigin(0.5);
            const label = this.add.text(x, 18, entry[0], {
                ...UITheme.text.body,
                fontSize: "9px",
                color: "#64748B",
                letterSpacing: 2
            }).setOrigin(0.5);
            panel.add([icon, value, label]);

            if (index < entries.length - 1) {
                panel.add(this.add.rectangle(x + spacing / 2, 0, 1, 42, 0x64748b, 0.22));
            }
        });
    }

    createGlassPanel(x, y, width, height, accent, depth = 20) {
        const c = this.add.container(x, y).setDepth(depth);
        c.width = width;
        c.height = height;

        const shadow = this.add.rectangle(6, 8, width, height, 0x000000, 0.34);
        const outerGlow = this.add.rectangle(0, 0, width + 8, height + 8, accent, 0)
            .setStrokeStyle(2, accent, 0.18);
        const bg = this.add.rectangle(0, 0, width, height, 0x050f1f, 0.9)
            .setStrokeStyle(2, accent, 0.82);
        const topHighlight = this.add.rectangle(0, -height / 2 + 3, width - 12, 2, 0x7dd3fc, 0.4);
        const lowerShade = this.add.rectangle(0, height / 2 - 9, width - 10, 16, 0x020617, 0.3);

        c.add([shadow, outerGlow, bg, topHighlight, lowerShade]);

        const cornerSize = 16;
        const corners = [
            [-width / 2 + 2, -height / 2 + 2, 1, 1],
            [width / 2 - 2, -height / 2 + 2, -1, 1],
            [-width / 2 + 2, height / 2 - 2, 1, -1],
            [width / 2 - 2, height / 2 - 2, -1, -1]
        ];
        corners.forEach(([cx, cy, sx, sy]) => {
            const g = this.add.graphics();
            g.lineStyle(2, accent, 0.95);
            g.beginPath();
            g.moveTo(cx, cy + cornerSize * sy);
            g.lineTo(cx, cy);
            g.lineTo(cx + cornerSize * sx, cy);
            g.strokePath();
            c.add(g);
        });

        return c;
    }

    handlePlay() {
        if (this.launching) return;

        if (this.isMobileDevice() && !this.isFullscreenActive()) {
            this.showFullscreenPrompt();
            return;
        }

        this.beginLaunchSequence();
    }

    beginLaunchSequence() {
        if (this.launching) return;
        this.launching = true;
        this.soundManager.sfx("button", 0.6);

        const refs = this.hangarRefs;
        this.tweens.killTweensOf([refs.ship, refs.shipGlow]);

        this.tweens.add({
            targets: refs.leftArm,
            x: "-=125",
            angle: -32,
            alpha: 0.5,
            duration: 520,
            ease: "Cubic.easeInOut"
        });

        this.tweens.add({
            targets: refs.rightArm,
            x: "+=125",
            angle: 32,
            alpha: 0.5,
            duration: 520,
            ease: "Cubic.easeInOut"
        });

        this.tweens.add({
            targets: [refs.beam, refs.core, refs.floorAura],
            alpha: 1,
            scaleX: 1.25,
            scaleY: 1.25,
            duration: 520,
            ease: "Quad.easeOut"
        });

        this.cameras.main.flash(260, 56, 189, 248, false);

        this.tweens.add({
            targets: refs.ship,
            y: -180,
            scaleX: refs.ship.scaleX * 1.16,
            scaleY: refs.ship.scaleY * 1.16,
            duration: 1050,
            delay: 380,
            ease: "Cubic.easeIn",
            onComplete: () => this.startNewGame()
        });
    }

    isMobileDevice() {
        return this.sys.game.device.input.touch ||
            window.matchMedia("(pointer: coarse)").matches ||
            window.innerWidth <= 900;
    }

    isFullscreenActive() {
        return Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }

    async requestGameFullscreen() {
        const target = document.getElementById("game") || this.game.canvas;
        if (!target) return false;

        try {
            if (target.requestFullscreen) {
                await target.requestFullscreen({ navigationUI: "hide" });
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
            console.warn("Fullscreen request failed:", error);
        }
        return false;
    }

    showFullscreenPrompt() {
        if (this.fullscreenPromptOpen) return;
        this.fullscreenPromptOpen = true;
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.92)
            .setDepth(3000)
            .setInteractive();
        const panel = this.createGlassPanel(width / 2, height / 2, 560, 300, 0x38bdf8, 3001);

        const title = this.add.text(width / 2, height / 2 - 90, "FULL SCREEN", {
            ...UITheme.text.title,
            fontSize: "38px",
            color: "#38BDF8"
        }).setOrigin(0.5).setDepth(3002);

        const message = this.add.text(width / 2, height / 2 - 30,
            "For the best mobile experience,\nplay in landscape full screen.", {
                ...UITheme.text.body,
                fontSize: "19px",
                color: "#E2E8F0",
                align: "center",
                lineSpacing: 8
            }).setOrigin(0.5).setDepth(3002);

        const enter = this.createPromptButton(width / 2, height / 2 + 55, "ENTER FULLSCREEN", "#22C55E", async () => {
            await this.requestGameFullscreen();
            this.destroyFullscreenPrompt(overlay, panel, title, message, enter, skip);
            this.beginLaunchSequence();
        });

        const skip = this.createPromptButton(width / 2, height / 2 + 115, "PLAY WITHOUT FULLSCREEN", "#94A3B8", () => {
            this.destroyFullscreenPrompt(overlay, panel, title, message, enter, skip);
            this.beginLaunchSequence();
        });
    }

    createPromptButton(x, y, text, color, callback) {
        const button = this.add.text(x, y, text, {
            ...UITheme.text.title,
            fontSize: "21px",
            color,
            backgroundColor: "#0B1728",
            padding: { left: 22, right: 22, top: 10, bottom: 10 }
        }).setOrigin(0.5).setDepth(3003).setInteractive({ useHandCursor: true });

        button.on("pointerover", () => button.setScale(1.04).setColor("#FACC15"));
        button.on("pointerout", () => button.setScale(1).setColor(color));
        button.on("pointerdown", callback);
        return button;
    }

    destroyFullscreenPrompt(...objects) {
        objects.forEach(object => object?.active && object.destroy());
        this.fullscreenPromptOpen = false;
    }

    startNewGame() {
        this.soundManager.stopMusic();
        this.registry.set("currentStage", 1);
        this.registry.set("checkpointStage", 1);
        this.registry.set("checkpointWave", 1);
        this.registry.set("checkpointScore", 0);
        this.scene.start("GameScene");
    }

    openScene(key) {
        if (this.launching) return;
        this.soundManager.sfx("button", 0.45);
        this.scene.start(key);
    }
}
