import Phaser from "phaser";
import SettingsMenu from "./SettingsMenu";

const COLORS = {
    cyan: 0x34d8ff,
    green: 0x4dffb8,
    purple: 0xa78bfa,
    red: 0xff4d6d,
    white: 0xeaf8ff,
    muted: 0x64859a,
    dark: 0x02070d
};

export default class PauseMenu {
    constructor(scene) {
        this.scene = scene;

        this.visible = false;
        this.panel = null;
        this.settingsMenu = null;
        this.previousMusicVolume = null;
        this.pauseButton = null;
        this.escapeHandler = null;

        this.createPauseButton();
        this.registerKeyboard();
    }

    isMobile() {
        return (
            this.scene.registry.get("isMobile") === true ||
            this.scene.sys.game.device.input.touch ||
            (typeof window !== "undefined" && window.innerWidth <= 900)
        );
    }

    registerKeyboard() {
        if (!this.scene.input.keyboard) return;

        this.escapeHandler = () => {
            if (this.scene.isGameOver) return;

            if (this.settingsMenu) {
                this.closeSettings();
                return;
            }

            this.toggle();
        };

        this.scene.input.keyboard.on("keydown-ESC", this.escapeHandler);
    }

    createPauseButton() {
        if (!this.isMobile()) return;

        const x = this.scene.scale.width - 42;
        const y = 42;

        const container = this.scene.add.container(x, y)
            .setDepth(1800)
            .setScrollFactor(0)
            .setSize(54, 54)
            .setInteractive({ useHandCursor: true });

        const glow = this.scene.add.rectangle(0, 0, 54, 54, COLORS.cyan, 0.06)
            .setStrokeStyle(1, COLORS.cyan, 0.55);
        const topLine = this.scene.add.rectangle(0, -27, 24, 2, COLORS.cyan, 0.95);
        const icon = this.scene.add.text(0, -1, "Ⅱ", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "23px",
            color: "#EAF8FF"
        }).setOrigin(0.5);
        const label = this.scene.add.text(0, 35, "PAUSE", {
            fontFamily: "Arial, sans-serif",
            fontSize: "7px",
            color: "#64859A",
            letterSpacing: 2
        }).setOrigin(0.5);

        container.add([glow, topLine, icon, label]);

        container.on("pointerover", () => {
            glow.setFillStyle(COLORS.cyan, 0.14);
            glow.setStrokeStyle(1, COLORS.cyan, 1);
            icon.setColor("#34D8FF");
        });

        container.on("pointerout", () => {
            glow.setFillStyle(COLORS.cyan, 0.06);
            glow.setStrokeStyle(1, COLORS.cyan, 0.55);
            icon.setColor("#EAF8FF");
        });

        container.on("pointerdown", () => {
            if (this.scene.isGameOver) return;
            this.scene.soundManager?.sfx?.("button", 0.4);
            this.toggle();
        });

        this.pauseButton = container;
    }

    show() {
        if (this.visible || this.scene.isGameOver) return;

        this.visible = true;
        this.scene.isPausedByMenu = true;

        this.scene.physics.pause();
        this.scene.time.paused = true;

        const currentMusic = this.scene.soundManager?.currentMusic;
        if (currentMusic) {
            this.previousMusicVolume = currentMusic.volume;
            currentMusic.setVolume(Math.max(0.04, currentMusic.volume * 0.3));
        }

        this.createPausePanel();
        this.pauseButton?.setVisible(false);
    }

    createPausePanel() {
        this.destroyPanel();

        const { width, height } = this.scene.scale;
        const mobile = this.isMobile();
        const scale = Math.min(width / 1280, height / 720);
        const panel = this.scene.add.container(0, 0)
            .setDepth(2000)
            .setScrollFactor(0);

        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            COLORS.dark,
            0.78
        );

        const rightShade = this.scene.add.rectangle(
            width * (mobile ? 0.5 : 0.77),
            height / 2,
            width * (mobile ? 1 : 0.46),
            height,
            0x000000,
            mobile ? 0.22 : 0.42
        );

        const scanlines = this.scene.add.graphics().setAlpha(0.12);
        scanlines.lineStyle(1, 0x7ddfff, 0.13);
        for (let y = 0; y < height; y += 5) {
            scanlines.lineBetween(0, y, width, y);
        }
        scanlines.setBlendMode(Phaser.BlendModes.SCREEN);

        panel.add([overlay, rightShade, scanlines]);

        if (!mobile) {
            this.createMissionReadout(panel, width, height, scale);
        }

        this.createPauseNavigation(panel, width, height, scale, mobile);
        this.createFrameCorners(panel, width, height);

        this.panel = panel;
    }

    createMissionReadout(panel, width, height, scale) {
        const x = width * 0.075;
        const y = height * 0.2;
        const stage = this.scene.waveManager?.stage || this.scene.registry.get("currentStage") || 1;
        const wave = this.scene.waveManager?.wave || 1;
        const score = this.scene.score || 0;
        const hp = Math.max(0, this.scene.playerHP || 0);
        const maxHP = Math.max(1, this.scene.maxPlayerHP || 3);

        const eyebrow = this.scene.add.text(x, y, "JUDE FLEET COMMAND  /  COMBAT HOLD", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#64859A",
            letterSpacing: 3
        });

        const title = this.scene.add.text(x, y + 28 * scale, "MISSION", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(58 * scale)}px`,
            color: "#EAF8FF",
            letterSpacing: 1
        });

        const titleAccent = this.scene.add.text(x, y + 83 * scale, "PAUSED", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(58 * scale)}px`,
            color: "#34D8FF",
            letterSpacing: 1
        });

        const line = this.scene.add.graphics();
        line.lineStyle(1, COLORS.cyan, 0.45);
        line.lineBetween(x, y + 154 * scale, width * 0.48, y + 154 * scale);
        line.fillStyle(COLORS.cyan, 1);
        line.fillRect(x, y + 152 * scale, 58 * scale, 4);

        const status = this.scene.add.text(x, y + 177 * scale, "TACTICAL SYSTEMS SUSPENDED", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#4DFFB8",
            letterSpacing: 3
        });

        const telemetry = [
            ["SECTOR", `STAGE ${stage}`],
            ["WAVE", String(wave).padStart(2, "0")],
            ["SCORE", Number(score).toLocaleString("en-US")],
            ["HULL", `${hp} / ${maxHP}`]
        ];

        const telemetryObjects = [];
        telemetry.forEach(([label, value], index) => {
            const tx = x + (index % 2) * width * 0.19;
            const ty = y + (225 + Math.floor(index / 2) * 67) * scale;

            const labelText = this.scene.add.text(tx, ty, label, {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
                color: "#64859A",
                letterSpacing: 2
            });
            const valueText = this.scene.add.text(tx, ty + 18 * scale, value, {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: `${Math.max(14, Math.round(18 * scale))}px`,
                color: "#DDF8FF"
            });
            telemetryObjects.push(labelText, valueText);
        });

        const hint = this.scene.add.text(x, height - 52, "ESC  //  RESUME COMBAT", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
            color: "#527286",
            letterSpacing: 2
        });

        panel.add([eyebrow, title, titleAccent, line, status, ...telemetryObjects, hint]);
    }

    createPauseNavigation(panel, width, height, scale, mobile) {
        const x = mobile ? width * 0.12 : width * 0.66;
        const menuWidth = mobile ? width * 0.76 : width * 0.285;
        const top = mobile ? height * 0.16 : height * 0.22;
        const gap = mobile ? Math.min(76, height * 0.135) : 84 * scale;

        const section = this.scene.add.text(x, top - 54 * scale, "COMMAND MENU", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#64859A",
            letterSpacing: 4
        });

        const topLine = this.scene.add.graphics();
        topLine.lineStyle(1, COLORS.cyan, 0.3);
        topLine.lineBetween(x, top - 26 * scale, x + menuWidth, top - 26 * scale);
        topLine.fillStyle(COLORS.cyan, 1);
        topLine.fillRect(x, top - 28 * scale, 42 * scale, 4);

        panel.add([section, topLine]);

        const items = [
            {
                index: "01",
                label: "RESUME MISSION",
                sublabel: "RETURN TO COMBAT",
                color: COLORS.green,
                action: () => this.hide()
            },
            {
                index: "02",
                label: "RESTART CHECKPOINT",
                sublabel: "RESTORE LAST COMBAT SAVE",
                color: COLORS.cyan,
                action: () => this.restartCheckpoint()
            },
            {
                index: "03",
                label: "SYSTEM SETTINGS",
                sublabel: "AUDIO AND GAME OPTIONS",
                color: COLORS.purple,
                action: () => this.openSettings()
            },
            {
                index: "04",
                label: "RETURN TO COMMAND",
                sublabel: "ABORT CURRENT MISSION",
                color: COLORS.red,
                action: () => this.goToMainMenu()
            }
        ];

        items.forEach((item, index) => {
            const button = this.createMenuItem(
                x,
                top + index * gap,
                menuWidth,
                Math.min(66, gap - 8),
                item
            );
            panel.add(button);
        });

        if (mobile) {
            const mobileTitle = this.scene.add.text(width / 2, 54, "MISSION PAUSED", {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: `${Math.max(25, Math.round(34 * scale))}px`,
                color: "#EAF8FF",
                letterSpacing: 1
            }).setOrigin(0.5);

            const mobileStatus = this.scene.add.text(width / 2, 86, "TACTICAL SYSTEMS SUSPENDED", {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
                color: "#4DFFB8",
                letterSpacing: 2
            }).setOrigin(0.5);

            panel.add([mobileTitle, mobileStatus]);
        }
    }

    createMenuItem(x, y, width, height, config) {
        const container = this.scene.add.container(x, y)
            .setSize(width, height)
            .setInteractive(
                new Phaser.Geom.Rectangle(0, 0, width, height),
                Phaser.Geom.Rectangle.Contains
            );

        const hover = this.scene.add.rectangle(0, 0, width, height, config.color, 0)
            .setOrigin(0, 0);
        const marker = this.scene.add.rectangle(0, 0, 3, height, config.color, 0.68)
            .setOrigin(0, 0);
        const indexText = this.scene.add.text(18, 8, config.index, {
            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            color: "#527286",
            letterSpacing: 1
        });
        const label = this.scene.add.text(54, 3, config.label, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "18px",
            color: "#DDF8FF",
            letterSpacing: 1
        });
        const sublabel = this.scene.add.text(55, 30, config.sublabel, {
            fontFamily: "Arial, sans-serif",
            fontSize: "8px",
            color: "#64859A",
            letterSpacing: 2
        });
        const arrow = this.scene.add.text(width - 8, height / 2 - 2, "›", {
            fontFamily: "Arial, sans-serif",
            fontSize: "26px",
            color: "#527286"
        }).setOrigin(1, 0.5);
        const divider = this.scene.add.rectangle(0, height - 1, width, 1, COLORS.cyan, 0.12)
            .setOrigin(0, 0.5);

        container.add([hover, marker, indexText, label, sublabel, arrow, divider]);

        container.on("pointerover", () => {
            hover.setFillStyle(config.color, 0.08);
            marker.setAlpha(1);
            label.setColor(Phaser.Display.Color.IntegerToColor(config.color).rgba);
            arrow.setColor("#EAF8FF");
        });

        container.on("pointerout", () => {
            hover.setFillStyle(config.color, 0);
            marker.setAlpha(0.68);
            label.setColor("#DDF8FF");
            arrow.setColor("#527286");
        });

        container.on("pointerdown", () => {
            this.scene.soundManager?.sfx?.("button", 0.4);
            config.action();
        });

        return container;
    }

    createFrameCorners(panel, width, height) {
        const frame = this.scene.add.graphics();
        frame.lineStyle(1, COLORS.cyan, 0.32);

        const margin = 18;
        const size = 26;
        frame.lineBetween(margin, margin, margin + size, margin);
        frame.lineBetween(margin, margin, margin, margin + size);
        frame.lineBetween(width - margin, margin, width - margin - size, margin);
        frame.lineBetween(width - margin, margin, width - margin, margin + size);
        frame.lineBetween(margin, height - margin, margin + size, height - margin);
        frame.lineBetween(margin, height - margin, margin, height - margin - size);
        frame.lineBetween(width - margin, height - margin, width - margin - size, height - margin);
        frame.lineBetween(width - margin, height - margin, width - margin, height - margin - size);

        panel.add(frame);
    }

    openSettings() {
        this.destroyPanel();

        this.settingsMenu = new SettingsMenu(this.scene, () => {
            this.settingsMenu = null;
            this.createPausePanel();
        });
    }

    closeSettings() {
        if (!this.settingsMenu) return;

        this.settingsMenu.destroy();
        this.settingsMenu = null;
        this.createPausePanel();
    }

    hide() {
        if (!this.visible) return;

        this.destroySettings();
        this.scene.time.paused = false;
        this.scene.physics.resume();
        this.restoreMusicVolume();
        this.destroyPanel();

        this.visible = false;
        this.scene.isPausedByMenu = false;
        this.pauseButton?.setVisible(true);
    }

    restoreMusicVolume() {
        const manager = this.scene.soundManager;
        const currentMusic = manager?.currentMusic;

        if (!currentMusic || this.previousMusicVolume === null) return;

        const muted = typeof manager.isMuted === "function" && manager.isMuted();
        const savedVolume = typeof manager.getMusicVolume === "function"
            ? manager.getMusicVolume()
            : this.previousMusicVolume;

        currentMusic.setVolume(muted ? 0 : savedVolume);
        this.previousMusicVolume = null;
    }

    restartCheckpoint() {
        this.prepareSceneExit();

        if (this.scene.checkpointManager?.restartFromCheckpoint) {
            this.scene.checkpointManager.restartFromCheckpoint();
        } else {
            this.scene.scene.restart();
        }
    }

    goToMainMenu() {
        this.prepareSceneExit();
        this.scene.soundManager?.stopMusic?.();
        this.scene.scene.start("MenuScene");
    }

    prepareSceneExit() {
        this.scene.time.paused = false;
        this.scene.physics.resume();

        if (this.scene.soundManager?.currentMusic) {
            this.scene.soundManager.currentMusic.stop();
        }

        this.destroySettings();
        this.destroyPanel();
        this.visible = false;
        this.scene.isPausedByMenu = false;
    }

    destroySettings() {
        if (!this.settingsMenu) return;
        this.settingsMenu.destroy();
        this.settingsMenu = null;
    }

    destroyPanel() {
        if (!this.panel) return;
        this.panel.destroy(true);
        this.panel = null;
    }

    toggle() {
        this.visible ? this.hide() : this.show();
    }

    destroy() {
        this.scene.time.paused = false;
        this.scene.physics.resume();

        if (this.escapeHandler && this.scene.input.keyboard) {
            this.scene.input.keyboard.off("keydown-ESC", this.escapeHandler);
        }

        this.destroySettings();
        this.destroyPanel();
        this.pauseButton?.destroy();

        this.pauseButton = null;
        this.escapeHandler = null;
        this.visible = false;
        this.scene.isPausedByMenu = false;
    }
}