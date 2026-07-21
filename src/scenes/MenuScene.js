import Phaser from "phaser";
import SoundManager from "../managers/SoundManager.js";
import SaveManager from "../managers/SaveManager.js";
import XPManager from "../managers/XPManager.js";

const COLORS = {
    cyan: 0x34d8ff,
    blue: 0x087ea4,
    green: 0x4dffb8,
    gold: 0xffd166,
    red: 0xff4d6d,
    white: 0xeaf8ff,
    muted: 0x64859a,
    dark: 0x02070d
};

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        const { width, height } = this.scale;

        this.soundManager = new SoundManager(this);
        this.saveManager = new SaveManager(this);
        this.xpManager = new XPManager(this);
        this.launching = false;
        this.fullscreenPromptOpen = false;
        this.menuObjects = [];

        this.cameras.main.setBackgroundColor("#01050a");
        this.createCinematicBackground(width, height);
        this.createTopBrand(width, height);
        this.createLaunchBay(width, height);
        this.createMissionNavigation(width, height);
        this.createPilotTelemetry(width, height);
        this.createCornerHud(width, height);

        this.soundManager.playMusic("menu_music", 0.35);
        this.cameras.main.fadeIn(900, 0, 4, 10);

        this.input.keyboard?.on("keydown-ENTER", () => this.handlePlay());
        this.input.keyboard?.on("keydown-H", () => this.openScene("HangarScene"));
        this.input.keyboard?.on("keydown-P", () => this.openScene("ProfileScene"));
        this.input.keyboard?.on("keydown-I", () => this.openScene("InfoScene"));

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.statusTimer?.remove(false);
            this.input.keyboard?.removeAllListeners();
        });
    }

    createCinematicBackground(width, height) {
        const background = this.add.image(width / 2, height / 2, "background_space")
            .setDisplaySize(width, height)
            .setDepth(-50);

        this.tweens.add({
            targets: background,
            scaleX: 1.035,
            scaleY: 1.035,
            duration: 16000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        const atmosphere = this.add.graphics().setDepth(-48);
        atmosphere.fillGradientStyle(0x020711, 0x020711, 0x03131f, 0x02070d, 0.2, 0.42, 0.8, 0.96);
        atmosphere.fillRect(0, 0, width, height);
        atmosphere.fillStyle(0x000000, 0.42);
        atmosphere.fillRect(width * 0.72, 0, width * 0.28, height);

        const horizon = this.add.ellipse(width * 0.42, height * 0.7, width * 0.72, height * 0.36, COLORS.cyan, 0.055)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(-46);

        this.tweens.add({
            targets: horizon,
            alpha: { from: 0.025, to: 0.1 },
            scaleX: { from: 0.94, to: 1.08 },
            duration: 4800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        for (let i = 0; i < 72; i++) {
            const depth = Phaser.Math.FloatBetween(0.25, 1);
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(0.35, 1.3) * depth,
                i % 9 === 0 ? COLORS.cyan : 0xffffff,
                Phaser.Math.FloatBetween(0.08, 0.58)
            ).setDepth(-45);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.08, 0.8),
                duration: Phaser.Math.Between(1100, 3600),
                yoyo: true,
                repeat: -1
            });
        }

        const scanlines = this.add.graphics().setDepth(190).setAlpha(0.1);
        scanlines.lineStyle(1, 0x7ddfff, 0.14);
        for (let y = 0; y < height; y += 5) scanlines.lineBetween(0, y, width, y);
        scanlines.setBlendMode(Phaser.BlendModes.SCREEN);

        const sweep = this.add.rectangle(width / 2, -30, width, 54, COLORS.cyan, 0.018)
            .setDepth(189)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
            targets: sweep,
            y: height + 30,
            duration: 6200,
            repeat: -1,
            ease: "Linear"
        });
    }

    createTopBrand(width, height) {
        const logoScale = Math.min(width / 1280, height / 720) * 0.31;
        const x = width * 0.13;
        const y = height * 0.12;

        const logoGlow = this.add.image(x, y + 3, "jude_space_logo")
            .setScale(logoScale * 1.045)
            .setTint(COLORS.cyan)
            .setAlpha(0.2)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(20);
        this.add.image(x, y, "jude_space_logo")
            .setScale(logoScale)
            .setDepth(21);

        this.tweens.add({
            targets: logoGlow,
            alpha: { from: 0.1, to: 0.34 },
            duration: 1700,
            yoyo: true,
            repeat: -1
        });

        const line = this.add.graphics().setDepth(21);
        line.lineStyle(1, COLORS.cyan, 0.5);
        line.lineBetween(34, height * 0.215, width * 0.31, height * 0.215);
        line.fillStyle(COLORS.cyan, 0.9);
        line.fillRect(34, height * 0.215 - 2, 42, 4);

        this.add.text(34, height * 0.228, "JUDE FLEET COMMAND  /  LIVE BUILD 01", {
            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            color: "#6F93A8",
            letterSpacing: 3
        }).setDepth(22);
    }

    createLaunchBay(width, height) {
        const cx = width * 0.39;
        const cy = height * 0.57;
        const radius = Math.min(width * 0.245, height * 0.35);
        const floorSize = radius * 2.12;

        // The hangar is built from the real transparent PNG layers.
        const shadow = this.add.image(cx, cy + radius * 0.12, "hangar_shadow")
            .setDepth(1)
            .setAlpha(0.82);
        const floor = this.add.image(cx, cy + radius * 0.08, "hangar_floor")
            .setDepth(2);
        const energyCore = this.add.image(cx, cy + radius * 0.08, "energy_core")
            .setDepth(3)
            .setBlendMode(Phaser.BlendModes.ADD);
        const beam = this.add.image(cx, cy - radius * 0.12, "hangar_beam")
            .setDepth(6)
            .setAlpha(0.36)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.fitAsset(shadow, floorSize * 1.08, floorSize * 1.08);
        this.fitAsset(floor, floorSize, floorSize);
        this.fitAsset(energyCore, radius * 1.04, radius * 1.04);
        this.fitAsset(beam, radius * 1.15, radius * 1.7);

        const armOffsetX = radius * 0.76;
        const armY = cy + radius * 0.06;
        const leftArm = this.add.image(cx - armOffsetX, armY, "robot_arm_left").setDepth(10);
        const rightArm = this.add.image(cx + armOffsetX, armY, "robot_arm_right").setDepth(10);
        this.fitAsset(leftArm, radius * 0.56, radius * 0.92);
        this.fitAsset(rightArm, radius * 0.56, radius * 0.92);

        const consoleY = cy + radius * 0.63;
        const leftConsole = this.add.image(cx - radius * 0.68, consoleY, "console_left").setDepth(11);
        const rightConsole = this.add.image(cx + radius * 0.68, consoleY, "console_right").setDepth(11);
        this.fitAsset(leftConsole, radius * 0.42, radius * 0.34);
        this.fitAsset(rightConsole, radius * 0.42, radius * 0.34);

        const bayGlow = this.add.ellipse(cx, cy + radius * 0.2, radius * 2.1, radius * 0.92, COLORS.cyan, 0.07)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(4);

        const selectedShip = this.saveManager.getSelectedShip();
        const requestedTexture = this.resolveShipTexture(selectedShip);
        const shipTexture = this.textures.exists(requestedTexture) ? requestedTexture : "player";
        const ship = this.add.image(cx, cy - radius * 0.13, shipTexture).setDepth(12);
        this.fitShip(ship, radius * 1.18, radius * 1.2);

        const shipShadow = this.add.ellipse(cx, cy + radius * 0.32, radius * 0.8, radius * 0.22, 0x000000, 0.55)
            .setDepth(7);
        const shipAura = this.add.ellipse(cx, ship.y + radius * 0.12, radius * 1.1, radius * 1.35, COLORS.cyan, 0.045)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(8);

        this.tweens.add({
            targets: [ship, shipAura],
            y: "-=8",
            duration: 2400,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
        this.tweens.add({
            targets: [bayGlow, beam, energyCore],
            alpha: { from: 0.16, to: 0.5 },
            duration: 1700,
            yoyo: true,
            repeat: -1
        });

        const tagY = Math.min(height - 124, cy + radius * 0.67);
        this.add.text(cx, tagY, String(selectedShip || "VANGUARD").toUpperCase(), {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(17 * Math.min(width / 1280, height / 720))}px`,
            color: "#DDF8FF",
            letterSpacing: 5
        }).setOrigin(0.5).setDepth(15);
        this.add.text(cx, tagY + 22, "ACTIVE STRIKE CRAFT  //  LAUNCH READY", {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: "#4DFFB8",
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(15);

        this.hangarRefs = {
            ship, shipAura, shipShadow, beam, bayGlow, energyCore,
            floor, shadow, leftArm, rightArm, leftConsole, rightConsole,
            cx, cy, radius
        };
    }

    fitAsset(image, maxWidth, maxHeight) {
        const source = image.texture.getSourceImage();
        const sourceWidth = source?.width || image.width || 1;
        const sourceHeight = source?.height || image.height || 1;
        image.setScale(Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight));
    }

    fitShip(ship, maxWidth, maxHeight) {
        const texture = ship.texture.getSourceImage();
        const sourceWidth = texture?.width || ship.width || 1;
        const sourceHeight = texture?.height || ship.height || 1;
        const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
        ship.setScale(scale);
    }

    resolveShipTexture(shipName = "player") {
        const map = {
            vanguard: "player",
            phantom: "ship_phantom",
            eclipse: "ship_eclipse",
            titan: "ship_titan",
            spectre: "ship_spectre",
            guardian: "ship_guardian",
            nova: "ship_nova"
        };
        return map[String(shipName).toLowerCase()] || "player";
    }

    createMissionNavigation(width, height) {
        const startX = width * 0.72;
        const centerY = height * 0.51;
        const scale = Math.min(width / 1280, height / 720);

        this.add.text(startX, centerY - 200 * scale, "MAIN DIRECTIVE", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.round(11 * scale)}px`,
            color: "#66899D",
            letterSpacing: 5
        }).setDepth(30);
        this.add.text(startX, centerY - 174 * scale, "SELECT OPERATION", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(28 * scale)}px`,
            color: "#EAF8FF",
            letterSpacing: 1
        }).setDepth(30);

        const navLine = this.add.graphics().setDepth(29);
        navLine.lineStyle(1, COLORS.cyan, 0.34);
        navLine.lineBetween(startX, centerY - 137 * scale, width - 38, centerY - 137 * scale);
        navLine.fillStyle(COLORS.cyan, 0.9);
        navLine.fillRect(startX, centerY - 139 * scale, 62, 4);

        const items = [
            { number: "01", title: "NEW CAMPAIGN", sub: "DEPLOY TO DEEP SPACE", accent: COLORS.cyan, action: () => this.handlePlay() },
            { number: "02", title: "HANGAR", sub: "FLEET & LOADOUT", accent: COLORS.green, action: () => this.openScene("HangarScene") },
            { number: "03", title: "PILOT PROFILE", sub: "LEVEL & COMBAT RECORD", accent: 0xb293ff, action: () => this.openScene("ProfileScene") },
            { number: "04", title: "ARCHIVES", sub: "INTEL & CREDITS", accent: COLORS.gold, action: () => this.openScene("InfoScene") }
        ];

        items.forEach((item, index) => {
            const y = centerY - 92 * scale + index * 72 * scale;
            this.createNavItem(startX, y, width - startX - 38, 58 * scale, item, index === 0, scale);
        });

        this.add.text(startX, centerY + 221 * scale, "ENTER  SELECT     H  HANGAR     P  PROFILE     I  ARCHIVES", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
            color: "#3E657A",
            letterSpacing: 1
        }).setDepth(30);
    }

    createNavItem(x, y, width, height, item, primary, scale) {
        const container = this.add.container(x, y).setDepth(32);
        const hit = this.add.zone(width / 2, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const rail = this.add.rectangle(0, 0, primary ? 5 : 2, height * 0.76, item.accent, primary ? 1 : 0.35).setOrigin(0, 0.5);
        const line = this.add.rectangle(0, height / 2 - 1, width, 1, item.accent, primary ? 0.34 : 0.13).setOrigin(0, 0.5);
        const glow = this.add.rectangle(0, 0, width, height, item.accent, primary ? 0.035 : 0).setOrigin(0, 0.5);
        const number = this.add.text(19 * scale, -2, item.number, {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.round(11 * scale)}px`,
            color: Phaser.Display.Color.IntegerToColor(item.accent).rgba,
            letterSpacing: 2
        }).setOrigin(0, 0.5);
        const title = this.add.text(62 * scale, -10 * scale, item.title, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round((primary ? 22 : 18) * scale)}px`,
            color: primary ? "#FFFFFF" : "#AFC4D0",
            letterSpacing: 1
        }).setOrigin(0, 0.5);
        const sub = this.add.text(63 * scale, 15 * scale, item.sub, {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
            color: "#58788A",
            letterSpacing: 2
        }).setOrigin(0, 0.5);
        const arrow = this.add.text(width - 18 * scale, 0, "›", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.round(30 * scale)}px`,
            color: primary ? "#34D8FF" : "#456779"
        }).setOrigin(1, 0.5);

        container.add([glow, line, rail, number, title, sub, arrow, hit]);
        hit.on("pointerover", () => {
            if (this.launching) return;
            this.soundManager.sfx("button", 0.18);
            rail.setDisplaySize(6, height * 0.9).setAlpha(1);
            glow.setFillStyle(item.accent, 0.1);
            title.setColor("#FFFFFF");
            arrow.setColor("#FFD166");
            this.tweens.add({ targets: [number, title, sub], x: "+=8", duration: 120, ease: "Quad.easeOut" });
        });
        hit.on("pointerout", () => {
            rail.setDisplaySize(primary ? 5 : 2, height * 0.76).setAlpha(primary ? 1 : 0.35);
            glow.setFillStyle(item.accent, primary ? 0.035 : 0);
            title.setColor(primary ? "#FFFFFF" : "#AFC4D0");
            arrow.setColor(primary ? "#34D8FF" : "#456779");
            number.x = 19 * scale;
            title.x = 62 * scale;
            sub.x = 63 * scale;
        });
        hit.on("pointerdown", item.action);

        if (primary) {
            this.tweens.add({
                targets: rail,
                alpha: { from: 0.55, to: 1 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createPilotTelemetry(width, height) {
        const profile = this.xpManager.getProfileData();
        const credits = this.saveManager.getCredits();
        const score = String(this.saveManager.getHighScore()).padStart(6, "0");
        const y = height - 48;

        const bar = this.add.graphics().setDepth(40);
        bar.fillStyle(0x020910, 0.82);
        bar.fillRect(0, height - 82, width, 82);
        bar.lineStyle(1, COLORS.cyan, 0.24);
        bar.lineBetween(0, height - 82, width, height - 82);
        bar.fillStyle(COLORS.cyan, 0.85);
        bar.fillRect(0, height - 84, width * 0.12, 3);

        const data = [
            ["PILOT", `LV ${profile.level}`, "#FFD166"],
            ["FLEET CREDITS", credits.toLocaleString("en-US"), "#34D8FF"],
            ["COMBAT RECORD", score, "#4DFFB8"],
            ["NETWORK", "ONLINE", "#4DFFB8"]
        ];
        const spacing = width / data.length;
        data.forEach((entry, index) => {
            const x = spacing * index + spacing / 2;
            this.add.text(x, y - 11, entry[0], {
                fontFamily: "Arial, sans-serif",
                fontSize: "9px",
                color: "#4D6C7D",
                letterSpacing: 2
            }).setOrigin(0.5).setDepth(42);
            this.add.text(x, y + 12, entry[1], {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "15px",
                color: entry[2],
                letterSpacing: 1
            }).setOrigin(0.5).setDepth(42);
            if (index < data.length - 1) {
                this.add.rectangle(spacing * (index + 1), y, 1, 35, 0x2a4c5e, 0.35).setDepth(42);
            }
        });
    }

    createCornerHud(width, height) {
        const top = this.add.graphics().setDepth(50);
        top.lineStyle(2, COLORS.cyan, 0.6);
        top.lineBetween(width - 225, 25, width - 35, 25);
        top.lineBetween(width - 35, 25, width - 35, 55);
        top.fillStyle(COLORS.red, 0.9);
        top.fillCircle(width - 213, 25, 3);

        const alert = this.add.text(width - 45, 39, "NOVA ACTIVITY  /  ELEVATED", {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: "#FF718A",
            letterSpacing: 2
        }).setOrigin(1, 0.5).setDepth(51);

        this.tweens.add({
            targets: alert,
            alpha: { from: 0.45, to: 1 },
            duration: 950,
            yoyo: true,
            repeat: -1
        });

        this.add.text(34, height - 101, "SECTOR 01  /  DEEP SPACE", {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: "#4B7287",
            letterSpacing: 2
        }).setDepth(51);
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
        this.soundManager.sfx("button", 0.65);

        const refs = this.hangarRefs;
        this.tweens.killTweensOf([refs.ship, refs.shipAura, refs.beam, refs.bayGlow]);
        refs.beam.setAlpha(0.2);

        this.tweens.add({
            targets: [refs.beam, refs.bayGlow],
            alpha: 0.75,
            scaleX: 1.25,
            duration: 430,
            ease: "Quad.easeOut"
        });
        this.tweens.add({
            targets: refs.shipShadow,
            scaleX: 0.35,
            alpha: 0,
            duration: 650,
            ease: "Quad.easeIn"
        });
        this.cameras.main.shake(420, 0.004);
        this.cameras.main.flash(220, 50, 210, 255, false);
        this.tweens.add({
            targets: refs.ship,
            y: -260,
            scaleX: refs.ship.scaleX * 1.2,
            scaleY: refs.ship.scaleY * 1.2,
            duration: 1050,
            delay: 300,
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
        return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    }

    async requestGameFullscreen() {
        const target = document.getElementById("game") || this.game.canvas;
        if (!target) return false;
        try {
            if (target.requestFullscreen) await target.requestFullscreen({ navigationUI: "hide" });
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            else if (target.msRequestFullscreen) target.msRequestFullscreen();
            return true;
        } catch (error) {
            console.warn("Fullscreen request failed:", error);
            return false;
        }
    }

    showFullscreenPrompt() {
        if (this.fullscreenPromptOpen) return;
        this.fullscreenPromptOpen = true;
        const { width, height } = this.scale;
        const objects = [];

        objects.push(this.add.rectangle(width / 2, height / 2, width, height, 0x01060c, 0.94)
            .setDepth(3000).setInteractive());
        objects.push(this.add.rectangle(width / 2, height / 2, 550, 290, 0x04111c, 0.98)
            .setStrokeStyle(1, COLORS.cyan, 0.72).setDepth(3001));
        objects.push(this.add.text(width / 2, height / 2 - 86, "FULL SCREEN PROTOCOL", {
            fontFamily: "Arial Black, Arial, sans-serif", fontSize: "30px", color: "#34D8FF", letterSpacing: 2
        }).setOrigin(0.5).setDepth(3002));
        objects.push(this.add.text(width / 2, height / 2 - 25,
            "For the best combat experience,\nrotate your device and enter full screen.", {
                fontFamily: "Arial, sans-serif", fontSize: "17px", color: "#CFE8F2", align: "center", lineSpacing: 8
            }).setOrigin(0.5).setDepth(3002));

        const enter = this.createPromptAction(width / 2, height / 2 + 62, "ENTER FULLSCREEN", COLORS.green, async () => {
            await this.requestGameFullscreen();
            this.destroyFullscreenPrompt(objects);
            this.beginLaunchSequence();
        });
        const skip = this.createPromptAction(width / 2, height / 2 + 112, "CONTINUE WINDOWED", COLORS.muted, () => {
            this.destroyFullscreenPrompt(objects);
            this.beginLaunchSequence();
        });
        objects.push(enter, skip);
    }

    createPromptAction(x, y, label, color, callback) {
        const text = this.add.text(x, y, label, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "16px",
            color: Phaser.Display.Color.IntegerToColor(color).rgba,
            letterSpacing: 2,
            padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(3003).setInteractive({ useHandCursor: true });
        text.on("pointerover", () => text.setColor("#FFFFFF").setScale(1.04));
        text.on("pointerout", () => text.setColor(Phaser.Display.Color.IntegerToColor(color).rgba).setScale(1));
        text.on("pointerdown", callback);
        return text;
    }

    destroyFullscreenPrompt(objects) {
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
        this.soundManager.sfx("button", 0.5);
        this.soundManager.stopMusic();
        this.scene.start(key);
    }
}