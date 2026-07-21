import Phaser from "phaser";

const COLORS = {
    cyan: 0x34d8ff,
    green: 0x4dffb8,
    purple: 0xa78bfa,
    gold: 0xffd166,
    red: 0xff4d6d,
    white: 0xeaf8ff,
    muted: 0x64859a,
    dark: 0x02070d
};

export default class SettingsMenu {
    constructor(scene, onBack) {
        this.scene = scene;
        this.onBack = onBack;

        this.panel = null;
        this.musicControl = null;
        this.sfxControl = null;
        this.muteControl = null;
        this.fullscreenControl = null;

        this.create();
    }

    isMobile() {
        return (
            this.scene.registry.get("isMobile") === true ||
            this.scene.sys.game.device.input.touch ||
            (typeof window !== "undefined" && window.innerWidth <= 900)
        );
    }

    create() {
        this.destroyPanel();

        const { width, height } = this.scene.scale;
        const mobile = this.isMobile();
        const scale = Math.min(width / 1280, height / 720);

        const panel = this.scene.add.container(0, 0)
            .setDepth(2200)
            .setScrollFactor(0);

        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            COLORS.dark,
            0.88
        );

        const rightShade = this.scene.add.rectangle(
            width * (mobile ? 0.5 : 0.77),
            height / 2,
            width * (mobile ? 1 : 0.46),
            height,
            0x000000,
            mobile ? 0.18 : 0.42
        );

        const scanlines = this.scene.add.graphics().setAlpha(0.11);
        scanlines.lineStyle(1, 0x7ddfff, 0.13);
        for (let y = 0; y < height; y += 5) {
            scanlines.lineBetween(0, y, width, y);
        }
        scanlines.setBlendMode(Phaser.BlendModes.SCREEN);

        panel.add([overlay, rightShade, scanlines]);

        if (!mobile) {
            this.createSystemReadout(panel, width, height, scale);
        }

        this.createControls(panel, width, height, scale, mobile);
        this.createFrameCorners(panel, width, height);

        this.panel = panel;
    }

    createSystemReadout(panel, width, height, scale) {
        const x = width * 0.075;
        const y = height * 0.2;
        const muted = this.scene.soundManager?.isMuted?.() === true;
        const fullscreen = this.scene.scale.isFullscreen;

        const eyebrow = this.scene.add.text(
            x,
            y,
            "JUDE FLEET COMMAND  /  SYSTEM CONTROL",
            {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
                color: "#64859A",
                letterSpacing: 3
            }
        );

        const title = this.scene.add.text(x, y + 28 * scale, "SYSTEM", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(58 * scale)}px`,
            color: "#EAF8FF",
            letterSpacing: 1
        });

        const titleAccent = this.scene.add.text(x, y + 83 * scale, "SETTINGS", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(58 * scale)}px`,
            color: "#A78BFA",
            letterSpacing: 1
        });

        const line = this.scene.add.graphics();
        line.lineStyle(1, COLORS.purple, 0.45);
        line.lineBetween(x, y + 154 * scale, width * 0.48, y + 154 * scale);
        line.fillStyle(COLORS.purple, 1);
        line.fillRect(x, y + 152 * scale, 58 * scale, 4);

        const status = this.scene.add.text(
            x,
            y + 177 * scale,
            "CONFIGURATION CHANNEL ONLINE",
            {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
                color: "#4DFFB8",
                letterSpacing: 3
            }
        );

        const telemetry = [
            ["AUDIO LINK", muted ? "MUTED" : "ACTIVE", muted ? "#FF4D6D" : "#DDF8FF"],
            ["DISPLAY MODE", fullscreen ? "FULLSCREEN" : "WINDOWED", "#DDF8FF"],
            ["MUSIC OUTPUT", `${Math.round(this.getMusicVolume() * 100)}%`, "#DDF8FF"],
            ["SFX OUTPUT", `${Math.round(this.getSfxVolume() * 100)}%`, "#DDF8FF"]
        ];

        const telemetryObjects = [];
        telemetry.forEach(([label, value, color], index) => {
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
                color
            });

            telemetryObjects.push(labelText, valueText);
        });

        const hint = this.scene.add.text(x, height - 52, "ESC  //  RETURN TO PAUSE MENU", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
            color: "#527286",
            letterSpacing: 2
        });

        panel.add([
            eyebrow,
            title,
            titleAccent,
            line,
            status,
            ...telemetryObjects,
            hint
        ]);
    }

    createControls(panel, width, height, scale, mobile) {
        const x = mobile ? width * 0.08 : width * 0.64;
        const controlWidth = mobile ? width * 0.84 : width * 0.31;
        const top = mobile ? 126 : height * 0.18;
        const volumeHeight = mobile ? 98 : 104 * scale;
        const actionHeight = mobile ? 62 : 64 * scale;
        const gap = mobile ? 12 : 14 * scale;

        if (mobile) {
            const title = this.scene.add.text(width / 2, 43, "SYSTEM SETTINGS", {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: `${Math.max(24, Math.round(32 * scale))}px`,
                color: "#EAF8FF",
                letterSpacing: 1
            }).setOrigin(0.5);

            const subtitle = this.scene.add.text(width / 2, 78, "AUDIO  /  DISPLAY", {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
                color: "#A78BFA",
                letterSpacing: 3
            }).setOrigin(0.5);

            panel.add([title, subtitle]);
        } else {
            const section = this.scene.add.text(x, top - 42 * scale, "AUDIO  /  DISPLAY", {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
                color: "#64859A",
                letterSpacing: 4
            });

            const topLine = this.scene.add.graphics();
            topLine.lineStyle(1, COLORS.purple, 0.3);
            topLine.lineBetween(x, top - 16 * scale, x + controlWidth, top - 16 * scale);
            topLine.fillStyle(COLORS.purple, 1);
            topLine.fillRect(x, top - 18 * scale, 42 * scale, 4);
            panel.add([section, topLine]);
        }

        let currentY = top;

        this.musicControl = this.createVolumeControl({
            x,
            y: currentY,
            width: controlWidth,
            height: volumeHeight,
            index: "01",
            label: "MUSIC VOLUME",
            sublabel: "MISSION AND MENU SOUNDTRACK",
            color: COLORS.cyan,
            getValue: () => this.getMusicVolume(),
            setValue: (value) => this.scene.soundManager?.setMusicVolume?.(value)
        });
        panel.add(this.musicControl.container);

        currentY += volumeHeight + gap;

        this.sfxControl = this.createVolumeControl({
            x,
            y: currentY,
            width: controlWidth,
            height: volumeHeight,
            index: "02",
            label: "SFX VOLUME",
            sublabel: "WEAPONS, IMPACTS AND INTERFACE",
            color: COLORS.green,
            getValue: () => this.getSfxVolume(),
            setValue: (value) => this.scene.soundManager?.setSfxVolume?.(value),
            preview: true
        });
        panel.add(this.sfxControl.container);

        currentY += volumeHeight + gap;

        this.muteControl = this.createActionControl({
            x,
            y: currentY,
            width: controlWidth,
            height: actionHeight,
            index: "03",
            label: this.getMuteLabel(),
            sublabel: "TOGGLE ALL AUDIO OUTPUT",
            color: COLORS.gold,
            action: () => {
                this.scene.soundManager?.toggleMute?.();
                this.muteControl.label.setText(this.getMuteLabel());
            }
        });
        panel.add(this.muteControl.container);

        currentY += actionHeight + gap;

        this.fullscreenControl = this.createActionControl({
            x,
            y: currentY,
            width: controlWidth,
            height: actionHeight,
            index: "04",
            label: this.getFullscreenLabel(),
            sublabel: "CHANGE DISPLAY MODE",
            color: COLORS.purple,
            action: () => this.toggleFullscreen()
        });
        panel.add(this.fullscreenControl.container);

        currentY += actionHeight + gap;

        const backControl = this.createActionControl({
            x,
            y: currentY,
            width: controlWidth,
            height: actionHeight,
            index: "05",
            label: "BACK TO PAUSE MENU",
            sublabel: "KEEP CURRENT SETTINGS",
            color: COLORS.red,
            action: () => this.goBack()
        });
        panel.add(backControl.container);
    }

    createVolumeControl(config) {
        const container = this.scene.add.container(config.x, config.y);
        const background = this.scene.add.rectangle(
            0,
            0,
            config.width,
            config.height,
            config.color,
            0.035
        ).setOrigin(0, 0).setStrokeStyle(1, config.color, 0.2);

        const marker = this.scene.add.rectangle(0, 0, 3, config.height, config.color, 0.82)
            .setOrigin(0, 0);

        const indexText = this.scene.add.text(16, 13, config.index, {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: "#527286",
            letterSpacing: 1
        });

        const label = this.scene.add.text(48, 8, config.label, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "16px",
            color: "#DDF8FF",
            letterSpacing: 1
        });

        const sublabel = this.scene.add.text(49, 32, config.sublabel, {
            fontFamily: "Arial, sans-serif",
            fontSize: "7px",
            color: "#64859A",
            letterSpacing: 1
        });

        const valueText = this.scene.add.text(config.width - 16, 9, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "16px",
            color: Phaser.Display.Color.IntegerToColor(config.color).rgba
        }).setOrigin(1, 0);

        const minusButton = this.createStepButton(
            config.width - 112,
            config.height - 36,
            "−",
            config.color,
            () => changeValue(-0.1)
        );

        const plusButton = this.createStepButton(
            config.width - 34,
            config.height - 36,
            "+",
            config.color,
            () => changeValue(0.1)
        );

        const trackX = 48;
        const trackY = config.height - 39;
        const trackWidth = Math.max(90, config.width - 190);
        const segmentGap = 3;
        const segmentWidth = (trackWidth - segmentGap * 9) / 10;
        const segments = [];

        for (let i = 0; i < 10; i++) {
            const segment = this.scene.add.rectangle(
                trackX + i * (segmentWidth + segmentGap),
                trackY,
                segmentWidth,
                9,
                config.color,
                0.12
            ).setOrigin(0, 0.5);
            segments.push(segment);
        }

        const refresh = () => {
            const value = Phaser.Math.Clamp(Number(config.getValue()) || 0, 0, 1);
            const activeSegments = Math.round(value * 10);
            valueText.setText(`${Math.round(value * 100)}%`);
            segments.forEach((segment, index) => {
                segment.setFillStyle(
                    config.color,
                    index < activeSegments ? 0.92 : 0.12
                );
            });
        };

        const changeValue = (amount) => {
            const current = Number(config.getValue()) || 0;
            const next = Phaser.Math.Clamp(Math.round((current + amount) * 10) / 10, 0, 1);
            config.setValue(next);
            refresh();

            if (config.preview && next > 0 && !this.scene.soundManager?.isMuted?.()) {
                this.scene.soundManager?.sfx?.("button", Math.max(0.15, next * 0.45));
            }
        };

        container.add([
            background,
            marker,
            indexText,
            label,
            sublabel,
            valueText,
            ...segments,
            minusButton,
            plusButton
        ]);

        refresh();

        return { container, label, valueText, segments, refresh };
    }

    createStepButton(x, y, text, color, action) {
        const size = 34;
        const container = this.scene.add.container(x, y)
            .setSize(size, size)
            .setInteractive(
                new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
                Phaser.Geom.Rectangle.Contains
            );

        const background = this.scene.add.rectangle(0, 0, size, size, color, 0.06)
            .setStrokeStyle(1, color, 0.5);
        const label = this.scene.add.text(0, -2, text, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "21px",
            color: "#DDF8FF"
        }).setOrigin(0.5);

        container.add([background, label]);

        container.on("pointerover", () => {
            background.setFillStyle(color, 0.18).setStrokeStyle(1, color, 1);
            container.setScale(1.05);
        });
        container.on("pointerout", () => {
            background.setFillStyle(color, 0.06).setStrokeStyle(1, color, 0.5);
            container.setScale(1);
        });
        container.on("pointerdown", () => action());

        return container;
    }

    createActionControl(config) {
        const container = this.scene.add.container(config.x, config.y)
            .setSize(config.width, config.height)
            .setInteractive(
                new Phaser.Geom.Rectangle(0, 0, config.width, config.height),
                Phaser.Geom.Rectangle.Contains
            );

        const hover = this.scene.add.rectangle(0, 0, config.width, config.height, config.color, 0)
            .setOrigin(0, 0);
        const marker = this.scene.add.rectangle(0, 0, 3, config.height, config.color, 0.68)
            .setOrigin(0, 0);
        const indexText = this.scene.add.text(16, 9, config.index, {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: "#527286",
            letterSpacing: 1
        });
        const label = this.scene.add.text(48, 5, config.label, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "15px",
            color: "#DDF8FF",
            letterSpacing: 1
        });
        const sublabel = this.scene.add.text(49, 29, config.sublabel, {
            fontFamily: "Arial, sans-serif",
            fontSize: "7px",
            color: "#64859A",
            letterSpacing: 1
        });
        const arrow = this.scene.add.text(config.width - 10, config.height / 2 - 2, "›", {
            fontFamily: "Arial, sans-serif",
            fontSize: "25px",
            color: "#527286"
        }).setOrigin(1, 0.5);
        const divider = this.scene.add.rectangle(0, config.height - 1, config.width, 1, COLORS.cyan, 0.12)
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

        return { container, label };
    }

    toggleFullscreen() {
        if (this.scene.scale.isFullscreen) {
            this.scene.scale.stopFullscreen();
            this.fullscreenControl?.label.setText("ENTER FULLSCREEN");
        } else {
            this.scene.scale.startFullscreen();
            this.fullscreenControl?.label.setText("EXIT FULLSCREEN");
        }
    }

    getMusicVolume() {
        return this.scene.soundManager?.getMusicVolume?.() ?? 0.35;
    }

    getSfxVolume() {
        return this.scene.soundManager?.getSfxVolume?.() ?? 0.7;
    }

    getMuteLabel() {
        return this.scene.soundManager?.isMuted?.()
            ? "UNMUTE ALL AUDIO"
            : "MUTE ALL AUDIO";
    }

    getFullscreenLabel() {
        return this.scene.scale.isFullscreen
            ? "EXIT FULLSCREEN"
            : "ENTER FULLSCREEN";
    }

    goBack() {
        this.destroy();

        if (typeof this.onBack === "function") {
            this.onBack();
        }
    }

    createFrameCorners(panel, width, height) {
        const frame = this.scene.add.graphics();
        frame.lineStyle(1, COLORS.purple, 0.34);

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

    destroyPanel() {
        if (!this.panel) return;
        this.panel.destroy(true);
        this.panel = null;
    }

    destroy() {
        this.destroyPanel();
        this.musicControl = null;
        this.sfxControl = null;
        this.muteControl = null;
        this.fullscreenControl = null;
    }
}