import UIButton from "./UIButton";
import UIPanel from "./UIPanel";

export default class SettingsMenu {
    constructor(scene, onBack) {
        this.scene = scene;
        this.onBack = onBack;
        this.panel = null;

        this.musicValueText = null;
        this.sfxValueText = null;
        this.muteButton = null;

        this.create();
    }

    create() {
        const isMobile = this.scene.registry.get("isMobile") === true;

        this.panel = new UIPanel(this.scene, {
            width: isMobile ? 500 : 620,
            height: isMobile ? 470 : 560,
            overlayAlpha: 0.86,
            depth: 2200,
            borderColor: 0xa78bfa
        });

        const title = this.scene.add.text(
            0,
            isMobile ? -180 : -220,
            "SETTINGS",
            {
                fontSize: isMobile ? "36px" : "46px",
                fontStyle: "bold",
                color: "#C4B5FD",
                stroke: "#020617",
                strokeThickness: 7
            }
        ).setOrigin(0.5);

        const subtitle = this.scene.add.text(
            0,
            isMobile ? -140 : -170,
            "AUDIO & DISPLAY",
            {
                fontSize: "17px",
                fontStyle: "bold",
                color: "#94A3B8",
                letterSpacing: 3
            }
        ).setOrigin(0.5);

        this.panel.addContent(title);
        this.panel.addContent(subtitle);

        this.createVolumeRow(
            isMobile ? -78 : -95,
            "MUSIC VOLUME",
            this.scene.soundManager.getMusicVolume(),
            (value) => {
                this.scene.soundManager.setMusicVolume(value);
            },
            (textObject) => {
                this.musicValueText = textObject;
            }
        );

        this.createVolumeRow(
            isMobile ? 0 : 5,
            "SFX VOLUME",
            this.scene.soundManager.getSfxVolume(),
            (value) => {
                this.scene.soundManager.setSfxVolume(value);
            },
            (textObject) => {
                this.sfxValueText = textObject;
            }
        );

        this.muteButton = new UIButton(
            this.scene,
            0,
            isMobile ? 86 : 110,
            this.getMuteLabel(),
            () => {
                this.scene.soundManager.toggleMute();
                this.muteButton.setText(this.getMuteLabel());
            },
            {
                width: isMobile ? 310 : 360,
                color: 0x172033,
                borderColor: 0xfacc15,
                hoverBorderColor: 0xfde68a
            }
        );

        const fullscreenButton = new UIButton(
            this.scene,
            0,
            isMobile ? 154 : 195,
            this.scene.scale.isFullscreen
                ? "EXIT FULLSCREEN"
                : "ENTER FULLSCREEN",
            () => {
                if (this.scene.scale.isFullscreen) {
                    this.scene.scale.stopFullscreen();
                    fullscreenButton.setText("ENTER FULLSCREEN");
                } else {
                    this.scene.scale.startFullscreen();
                    fullscreenButton.setText("EXIT FULLSCREEN");
                }
            },
            {
                width: isMobile ? 310 : 360,
                color: 0x0f2f2a,
                borderColor: 0x22c55e,
                hoverBorderColor: 0x86efac
            }
        );

        const backButton = new UIButton(
            this.scene,
            0,
            isMobile ? 222 : 280,
            "BACK",
            () => {
                this.destroy();

                if (typeof this.onBack === "function") {
                    this.onBack();
                }
            },
            {
                width: isMobile ? 310 : 360,
                color: 0x35151b,
                borderColor: 0xef4444,
                hoverBorderColor: 0xfca5a5
            }
        );

        this.panel.addContent(this.muteButton);
        this.panel.addContent(fullscreenButton);
        this.panel.addContent(backButton);
    }

    createVolumeRow(y, label, initialValue, onChange, setValueText) {
        const labelText = this.scene.add.text(
            -210,
            y,
            label,
            {
                fontSize: "22px",
                fontStyle: "bold",
                color: "#E2E8F0"
            }
        ).setOrigin(0, 0.5);

        const minusButton = new UIButton(
            this.scene,
            80,
            y,
            "−",
            () => {
                const current =
                    label === "MUSIC VOLUME"
                        ? this.scene.soundManager.getMusicVolume()
                        : this.scene.soundManager.getSfxVolume();

                const next = Math.max(0, current - 0.1);
                onChange(next);
                valueText.setText(`${Math.round(next * 100)}%`);
            },
            {
                width: 62,
                height: 52,
                fontSize: "30px",
                color: 0x172033,
                borderColor: 0x38bdf8
            }
        );

        const valueText = this.scene.add.text(
            145,
            y,
            `${Math.round(initialValue * 100)}%`,
            {
                fontSize: "23px",
                fontStyle: "bold",
                color: "#7DD3FC"
            }
        ).setOrigin(0.5);

        const plusButton = new UIButton(
            this.scene,
            210,
            y,
            "+",
            () => {
                const current =
                    label === "MUSIC VOLUME"
                        ? this.scene.soundManager.getMusicVolume()
                        : this.scene.soundManager.getSfxVolume();

                const next = Math.min(1, current + 0.1);
                onChange(next);
                valueText.setText(`${Math.round(next * 100)}%`);
            },
            {
                width: 62,
                height: 52,
                fontSize: "30px",
                color: 0x172033,
                borderColor: 0x38bdf8
            }
        );

        setValueText(valueText);

        this.panel.addContent(labelText);
        this.panel.addContent(minusButton);
        this.panel.addContent(valueText);
        this.panel.addContent(plusButton);
    }

    getMuteLabel() {
        return this.scene.soundManager.isMuted()
            ? "UNMUTE AUDIO"
            : "MUTE AUDIO";
    }

    destroy() {
        if (this.panel) {
            this.panel.destroy(true);
            this.panel = null;
        }
    }
}