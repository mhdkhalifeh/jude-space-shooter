import UIButton from "./UIButton";
import UIPanel from "./UIPanel";
import SettingsMenu from "./SettingsMenu";

export default class PauseMenu {
    constructor(scene) {
        this.scene = scene;

        this.visible = false;
        this.panel = null;
        this.settingsMenu = null;
        this.previousMusicVolume = null;
        this.pauseButton = null;

        this.createPauseButton();
        this.registerKeyboard();
    }

    registerKeyboard() {
        this.scene.input.keyboard.on("keydown-ESC", () => {
            if (this.scene.isGameOver) return;

            if (this.settingsMenu) {
                this.closeSettings();
                return;
            }

            this.toggle();
        });
    }

    createPauseButton() {
        const isMobile =
    this.scene.sys.game.device.input.touch ||
    window.innerWidth <= 900;

if (!isMobile) return;
        const x = this.scene.scale.width - 58;
        const y = 52;

        this.pauseButton = this.scene.add.text(
            x,
            y,
            "Ⅱ",
            {
                fontSize: "30px",
                fontStyle: "bold",
                color: "#FFFFFF",
                backgroundColor: "#0F172A",
                padding: {
                    left: 15,
                    right: 15,
                    top: 8,
                    bottom: 8
                },
                stroke: "#020617",
                strokeThickness: 4
            }
        )
            .setOrigin(0.5)
            .setDepth(1800)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        this.pauseButton.on("pointerover", () => {
            this.pauseButton.setColor("#7DD3FC");
            this.pauseButton.setScale(1.08);
        });

        this.pauseButton.on("pointerout", () => {
            this.pauseButton.setColor("#FFFFFF");
            this.pauseButton.setScale(1);
        });

        this.pauseButton.on("pointerdown", () => {
            if (this.scene.isGameOver) return;

            this.scene.soundManager?.sfx?.("button", 0.4);
            this.toggle();
        });
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
            currentMusic.setVolume(
                Math.max(0.05, this.previousMusicVolume * 0.35)
            );
        }

        this.createPausePanel();
        this.pauseButton.setVisible(false);
    }

    createPausePanel() {
        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }

        const isMobile = this.scene.registry.get("isMobile") === true;
        const panelScale = isMobile ? 0.82 : 1;

        this.panel = new UIPanel(this.scene, {
            width: isMobile ? 480 : 560,
            height: isMobile ? 440 : 520,
            overlayAlpha: 0.82,
            depth: 2000
        });

        const title = this.scene.add.text(
            0,
            isMobile ? -150 : -185,
            "GAME PAUSED",
            {
                fontSize: isMobile ? "36px" : "46px",
                fontStyle: "bold",
                color: "#38BDF8",
                stroke: "#020617",
                strokeThickness: 7
            }
        ).setOrigin(0.5);

        const subtitle = this.scene.add.text(
            0,
            isMobile ? -108 : -130,
            "JUDE SPACE SHOOTER",
            {
                fontSize: "17px",
                fontStyle: "bold",
                color: "#94A3B8",
                letterSpacing: 3
            }
        ).setOrigin(0.5);

        const resumeButton = new UIButton(
            this.scene,
            0,
            isMobile ? -45 : -55,
            "RESUME",
            () => this.hide(),
            {
                width: isMobile ? 300 : 340,
                color: 0x0f2f2a,
                borderColor: 0x22c55e,
                hoverBorderColor: 0x86efac
            }
        );

        const restartButton = new UIButton(
            this.scene,
            0,
            isMobile ? 22 : 30,
            "RESTART CHECKPOINT",
            () => this.restartCheckpoint(),
            {
                width: isMobile ? 300 : 340,
                color: 0x172033,
                borderColor: 0x38bdf8
            }
        );

        const settingsButton = new UIButton(
            this.scene,
            0,
            isMobile ? 89 : 115,
            "SETTINGS",
            () => this.openSettings(),
            {
                width: isMobile ? 300 : 340,
                color: 0x17152c,
                borderColor: 0xa78bfa,
                hoverBorderColor: 0xc4b5fd
            }
        );

        const menuButton = new UIButton(
            this.scene,
            0,
            isMobile ? 156 : 200,
            "MAIN MENU",
            () => this.goToMainMenu(),
            {
                width: isMobile ? 300 : 340,
                color: 0x35151b,
                borderColor: 0xef4444,
                hoverBorderColor: 0xfca5a5
            }
        );

        this.panel.addContent(title);
        this.panel.addContent(subtitle);
        this.panel.addContent(resumeButton);
        this.panel.addContent(restartButton);
        this.panel.addContent(settingsButton);
        this.panel.addContent(menuButton);
    }

    openSettings() {
        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }

        this.settingsMenu = new SettingsMenu(
            this.scene,
            () => {
                this.settingsMenu = null;
                this.createPausePanel();
            }
        );
    }

    closeSettings() {
        if (!this.settingsMenu) return;

        this.settingsMenu.destroy();
        this.settingsMenu = null;
        this.createPausePanel();
    }

    hide() {
        if (!this.visible) return;

        if (this.settingsMenu) {
            this.settingsMenu.destroy();
            this.settingsMenu = null;
        }

        this.scene.time.paused = false;
        this.scene.physics.resume();

        const currentMusic = this.scene.soundManager?.currentMusic;

        if (currentMusic && this.previousMusicVolume !== null) {
            currentMusic.setVolume(
                this.scene.soundManager.isMuted()
                    ? 0
                    : this.scene.soundManager.getMusicVolume()
            );
        }

        this.previousMusicVolume = null;

        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }

        this.visible = false;
        this.scene.isPausedByMenu = false;

        this.pauseButton?.setVisible(true);
    }

    restartCheckpoint() {
        this.scene.time.paused = false;

        if (this.scene.soundManager?.currentMusic) {
            this.scene.soundManager.currentMusic.stop();
        }

        if (this.settingsMenu) {
            this.settingsMenu.destroy();
            this.settingsMenu = null;
        }

        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }

        this.visible = false;
        this.scene.isPausedByMenu = false;

        if (this.scene.checkpointManager?.restartFromCheckpoint) {
            this.scene.checkpointManager.restartFromCheckpoint();
        } else {
            this.scene.scene.restart();
        }
    }

    goToMainMenu() {
        this.scene.time.paused = false;

        if (this.scene.soundManager?.stopMusic) {
            this.scene.soundManager.stopMusic();
        }

        if (this.settingsMenu) {
            this.settingsMenu.destroy();
            this.settingsMenu = null;
        }

        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }

        this.visible = false;
        this.scene.isPausedByMenu = false;

        this.scene.scene.start("MenuScene");
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy() {
        this.scene.time.paused = false;

        if (this.settingsMenu) {
            this.settingsMenu.destroy();
            this.settingsMenu = null;
        }

        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }

        if (this.pauseButton) {
            this.pauseButton.destroy();
            this.pauseButton = null;
        }

        this.visible = false;
        this.scene.isPausedByMenu = false;
    }
}