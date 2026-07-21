import Phaser from "phaser";
import SaveManager from "../managers/SaveManager.js";
import XPManager from "../managers/XPManager.js";
import SoundManager from "../managers/SoundManager.js";
import { SHIP_CATALOG, getShipById } from "../config/ShipCatalog.js";

const COLORS = {
    cyan: 0x34d8ff,
    green: 0x4dffb8,
    gold: 0xffd166,
    red: 0xff4d6d,
    white: 0xeaf8ff,
    muted: 0x64859a,
    dark: 0x02070d
};

export default class HangarScene extends Phaser.Scene {
    constructor() {
        super("HangarScene");
    }

    create() {
        const { width, height } = this.scale;

        this.saveManager = new SaveManager(this);
        this.xpManager = new XPManager(this);
        this.soundManager = new SoundManager(this);
        this.busy = false;

        const selectedId = this.saveManager.getSelectedShip();
        this.currentIndex = Math.max(
            0,
            SHIP_CATALOG.findIndex((ship) => ship.id === selectedId)
        );

        this.cameras.main.setBackgroundColor("#01050a");
        this.createCinematicBackground(width, height);
        this.createTopBrand(width, height);
        this.createLaunchBay(width, height);
        this.createShipDetails(width, height);
        this.createBottomTelemetry(width, height);
        this.createCornerHud(width, height);
        this.refresh();

        this.cameras.main.fadeIn(500, 0, 4, 10);
        this.input.keyboard?.on("keydown-LEFT", () => this.changeShip(-1));
        this.input.keyboard?.on("keydown-RIGHT", () => this.changeShip(1));
        this.input.keyboard?.on("keydown-ENTER", () => this.handleAction());
        this.input.keyboard?.on("keydown-ESC", () => this.goBack());

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
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
        atmosphere.fillGradientStyle(
            0x020711,
            0x020711,
            0x03131f,
            0x02070d,
            0.2,
            0.42,
            0.8,
            0.96
        );
        atmosphere.fillRect(0, 0, width, height);
        atmosphere.fillStyle(0x000000, 0.42);
        atmosphere.fillRect(width * 0.69, 0, width * 0.31, height);

        for (let i = 0; i < 58; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.FloatBetween(0.35, 1.25),
                i % 8 === 0 ? COLORS.cyan : 0xffffff,
                Phaser.Math.FloatBetween(0.08, 0.52)
            ).setDepth(-45);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.08, 0.72),
                duration: Phaser.Math.Between(1200, 3400),
                yoyo: true,
                repeat: -1
            });
        }

        const scanlines = this.add.graphics().setDepth(190).setAlpha(0.08);
        scanlines.lineStyle(1, 0x7ddfff, 0.12);
        for (let y = 0; y < height; y += 5) {
            scanlines.lineBetween(0, y, width, y);
        }
        scanlines.setBlendMode(Phaser.BlendModes.SCREEN);
    }

    createTopBrand(width, height) {
        const scale = Math.min(width / 1280, height / 720);

        this.add.text(34, 27, "JUDE FLEET COMMAND  /  HANGAR CONTROL", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#6F93A8",
            letterSpacing: 3
        }).setDepth(30);

        this.add.text(34, 48, "FLEET HANGAR", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(34 * scale)}px`,
            color: "#EAF8FF",
            letterSpacing: 1
        }).setDepth(30);

        const line = this.add.graphics().setDepth(29);
        line.lineStyle(1, COLORS.cyan, 0.42);
        line.lineBetween(34, 92 * scale, width * 0.3, 92 * scale);
        line.fillStyle(COLORS.cyan, 0.9);
        line.fillRect(34, 90 * scale, 54, 4);

        this.creditsTop = this.add.text(width - 38, 42, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(18 * scale)}px`,
            color: "#FFD166",
            letterSpacing: 1
        }).setOrigin(1, 0.5).setDepth(31);
    }

    createLaunchBay(width, height) {
        const scale = Math.min(width / 1280, height / 720);
        const cx = width * 0.36;
        const cy = height * 0.53;
        const radius = Math.min(width * 0.225, height * 0.31);
        const floorSize = radius * 2.1;

        const shadow = this.add.image(cx, cy + radius * 0.12, "hangar_shadow")
            .setDepth(1)
            .setAlpha(0.78);
        const floor = this.add.image(cx, cy + radius * 0.08, "hangar_floor")
            .setDepth(2);
        const core = this.add.image(cx, cy + radius * 0.08, "energy_core")
            .setDepth(3)
            .setAlpha(0.72);
        const beam = this.add.image(cx, cy - radius * 0.12, "hangar_beam")
            .setDepth(6)
            .setAlpha(0.22)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.fitAsset(shadow, floorSize * 1.08, floorSize * 1.08);
        this.fitAsset(floor, floorSize, floorSize);
        this.fitAsset(core, radius * 1.04, radius * 1.04);
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

        this.shipImage = this.add.image(cx, cy - radius * 0.13, "player")
            .setDepth(12)
            .clearTint()
            .setAlpha(1);

        this.shipMaxWidth = radius * 1.16;
        this.shipMaxHeight = radius * 1.18;

        this.shipShadow = this.add.ellipse(
            cx,
            cy + radius * 0.31,
            radius * 0.76,
            radius * 0.19,
            0x000000,
            0.52
        ).setDepth(7);

        this.shipLabel = this.add.text(cx, Math.min(height - 125, cy + radius * 0.69), "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(17 * scale)}px`,
            color: "#DDF8FF",
            letterSpacing: 4
        }).setOrigin(0.5).setDepth(15);

        this.shipStatus = this.add.text(cx, this.shipLabel.y + 22 * scale, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
            color: "#4DFFB8",
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(15);

        this.leftButton = this.createArrow(
            Math.max(44, cx - radius * 1.18),
            cy,
            "‹",
            () => this.changeShip(-1)
        );
        this.rightButton = this.createArrow(
            Math.min(width * 0.64, cx + radius * 1.18),
            cy,
            "›",
            () => this.changeShip(1)
        );
    }

    createShipDetails(width, height) {
        const scale = Math.min(width / 1280, height / 720);
        const x = width * 0.7;
        const panelWidth = width - x - 38;
        const top = height * 0.18;

        this.add.text(x, top, "FLEET DATABASE", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#66899D",
            letterSpacing: 4
        }).setDepth(30);

        this.shipName = this.add.text(x, top + 25 * scale, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.round(27 * scale)}px`,
            color: "#FFFFFF",
            letterSpacing: 1
        }).setDepth(30);

        this.shipClass = this.add.text(x, top + 60 * scale, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#7DDFFF",
            letterSpacing: 2
        }).setDepth(30);

        this.rarityText = this.add.text(width - 38, top + 2, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#FFD166",
            letterSpacing: 2
        }).setOrigin(1, 0).setDepth(30);

        const line = this.add.graphics().setDepth(29);
        line.lineStyle(1, COLORS.cyan, 0.28);
        line.lineBetween(x, top + 88 * scale, width - 38, top + 88 * scale);
        line.fillStyle(COLORS.cyan, 0.9);
        line.fillRect(x, top + 86 * scale, Math.min(54, panelWidth * 0.2), 4);

        this.description = this.add.text(x, top + 108 * scale, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(11, Math.round(13 * scale))}px`,
            color: "#AFC4D0",
            lineSpacing: 5,
            wordWrap: { width: panelWidth, useAdvancedWrap: true }
        }).setDepth(30);

        this.abilityText = this.add.text(x, top + 170 * scale, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#FFD166",
            letterSpacing: 1
        }).setDepth(30);

        this.statRows = {};
        const rows = ["DAMAGE", "FIRE RATE", "SPEED", "SHIELD"];
        rows.forEach((label, index) => {
            const y = top + (215 + index * 48) * scale;
            const labelText = this.add.text(x, y, label, {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
                color: "#7895A5",
                letterSpacing: 1
            }).setOrigin(0, 0.5).setDepth(31);

            const barX = x + 92 * scale;
            const deltaWidth = 48 * scale;
            const maxWidth = Math.max(70, panelWidth - 92 * scale - deltaWidth);
            const bg = this.add.rectangle(barX, y, maxWidth, 5 * scale, 0x17303e, 0.72)
                .setOrigin(0, 0.5)
                .setDepth(30);
            const bar = this.add.rectangle(barX, y, 20, 5 * scale, COLORS.cyan, 1)
                .setOrigin(0, 0.5)
                .setDepth(31);
            const delta = this.add.text(width - 38, y, "", {
                fontFamily: "Arial, sans-serif",
                fontSize: `${Math.max(8, Math.round(9 * scale))}px`,
                color: "#64859A"
            }).setOrigin(1, 0.5).setDepth(31);

            this.statRows[label] = { labelText, bg, bar, delta, maxWidth };
        });

        const actionY = Math.min(height - 116, top + 430 * scale);
        this.priceText = this.add.text(x, actionY - 30 * scale, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: `${Math.max(11, Math.round(13 * scale))}px`,
            color: "#FFD166",
            letterSpacing: 1
        }).setDepth(31);

        this.actionButton = this.createActionButton(
            x,
            actionY,
            panelWidth,
            Math.max(42, 48 * scale)
        );

        this.counterText = this.add.text(width - 38, actionY - 29 * scale, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
            color: "#64859A",
            letterSpacing: 2
        }).setOrigin(1, 0).setDepth(31);
    }

    createActionButton(x, y, width, height) {
        const container = this.add.container(x, y).setDepth(35);
        const hit = this.add.zone(width / 2, height / 2, width, height)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        const glow = this.add.rectangle(0, 0, width, height, COLORS.green, 0.055)
            .setOrigin(0, 0);
        const rail = this.add.rectangle(0, 0, 5, height, COLORS.green, 1)
            .setOrigin(0, 0);
        const line = this.add.rectangle(0, height - 1, width, 1, COLORS.green, 0.35)
            .setOrigin(0, 0.5);
        const label = this.add.text(20, height / 2, "SELECT SHIP", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "15px",
            color: "#FFFFFF",
            letterSpacing: 2
        }).setOrigin(0, 0.5);
        const arrow = this.add.text(width - 18, height / 2, "›", {
            fontFamily: "Arial, sans-serif",
            fontSize: "30px",
            color: "#4DFFB8"
        }).setOrigin(1, 0.5);

        container.add([glow, line, rail, label, arrow, hit]);
        container.label = label;
        container.glow = glow;
        container.rail = rail;
        container.line = line;
        container.arrow = arrow;
        container.hit = hit;

        hit.on("pointerover", () => {
            if (!container.enabled) return;
            glow.setAlpha(0.13);
            label.setX(28).setColor("#FFFFFF");
            arrow.setColor("#FFD166");
        });
        hit.on("pointerout", () => {
            glow.setAlpha(0.055);
            label.setX(20);
            arrow.setColor(container.accentHex || "#4DFFB8");
        });
        hit.on("pointerdown", () => this.handleAction());

        return container;
    }

    createArrow(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontFamily: "Arial, sans-serif",
            fontSize: "62px",
            color: "#7DDFFF",
            stroke: "#02070D",
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(40).setInteractive({ useHandCursor: true });

        button.on("pointerover", () => button.setScale(1.12).setColor("#FFD166"));
        button.on("pointerout", () => button.setScale(1).setColor("#7DDFFF"));
        button.on("pointerdown", callback);
        return button;
    }

    createBottomTelemetry(width, height) {
        const profile = this.xpManager.getProfileData();
        const y = height - 45;
        const bar = this.add.graphics().setDepth(40);
        bar.fillStyle(0x020910, 0.84);
        bar.fillRect(0, height - 82, width, 82);
        bar.lineStyle(1, COLORS.cyan, 0.24);
        bar.lineBetween(0, height - 82, width, height - 82);
        bar.fillStyle(COLORS.cyan, 0.85);
        bar.fillRect(0, height - 84, width * 0.12, 3);

        const back = this.add.text(34, y, "←  BACK TO COMMAND", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "12px",
            color: "#AFC4D0",
            letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(42).setInteractive({ useHandCursor: true });
        back.on("pointerover", () => back.setColor("#34D8FF"));
        back.on("pointerout", () => back.setColor("#AFC4D0"));
        back.on("pointerdown", () => this.goBack());

        const data = [
            ["PILOT LEVEL", `LV ${profile.level}`, "#FFD166"],
            ["NAVIGATION", "◀  ▶", "#34D8FF"],
            ["CONFIRM", "ENTER", "#4DFFB8"]
        ];
        const startX = width * 0.38;
        const availableWidth = width - startX - 30;
        const spacing = availableWidth / data.length;
        data.forEach((entry, index) => {
            const x = startX + spacing * index + spacing / 2;
            this.add.text(x, y - 11, entry[0], {
                fontFamily: "Arial, sans-serif",
                fontSize: "8px",
                color: "#4D6C7D",
                letterSpacing: 2
            }).setOrigin(0.5).setDepth(42);
            this.add.text(x, y + 10, entry[1], {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "12px",
                color: entry[2],
                letterSpacing: 1
            }).setOrigin(0.5).setDepth(42);
        });
    }

    createCornerHud(width, height) {
        const top = this.add.graphics().setDepth(50);
        top.lineStyle(2, COLORS.cyan, 0.55);
        top.lineBetween(width - 225, 25, width - 35, 25);
        top.lineBetween(width - 35, 25, width - 35, 60);
        top.fillStyle(COLORS.green, 0.9);
        top.fillCircle(width - 213, 25, 3);

        this.add.text(width - 45, 58, "HANGAR SYSTEMS  /  ONLINE", {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: "#4DFFB8",
            letterSpacing: 2
        }).setOrigin(1, 0.5).setDepth(51);
    }

    changeShip(direction) {
        if (this.busy) return;
        this.soundManager.sfx("button", 0.28);
        this.currentIndex = Phaser.Math.Wrap(
            this.currentIndex + direction,
            0,
            SHIP_CATALOG.length
        );
        this.refresh(true);
    }

    refresh(animate = false) {
        const ship = SHIP_CATALOG[this.currentIndex];
        const owned = this.saveManager.ownsShip(ship.id);
        const selected = this.saveManager.getSelectedShip() === ship.id;
        const level = this.xpManager.getLevel();
        const lockedByLevel = level < ship.unlockLevel;
        const texture = this.textures.exists(ship.texture) ? ship.texture : "player";

        this.shipImage
            .setTexture(texture)
            .clearTint()
            .setAlpha(1)
            .setAngle(0);
        this.fitShip(this.shipImage, this.shipMaxWidth, this.shipMaxHeight);

        this.shipLabel.setText(ship.name);
        this.shipStatus.setText(selected ? "ACTIVE STRIKE CRAFT  //  READY" : "FLEET CANDIDATE  //  INSPECTION");
        this.shipName.setText(ship.name);
        this.shipClass.setText(ship.className);
        this.rarityText.setText(ship.rarity);
        this.rarityText.setColor(this.getRarityColor(ship.rarity));
        this.description.setText(ship.description);
        this.abilityText.setText(`SIGNATURE  //  ${ship.ability || "STANDARD FRAME"}`);
        this.counterText.setText(`${String(this.currentIndex + 1).padStart(2, "0")} / ${String(SHIP_CATALOG.length).padStart(2, "0")}`);

        const activeShip = getShipById(this.saveManager.getSelectedShip());
        const stats = [
            ["DAMAGE", "damage", ship.stats.damage],
            ["FIRE RATE", "fireRate", ship.stats.fireRate],
            ["SPEED", "speed", ship.stats.speed],
            ["SHIELD", "shield", ship.stats.shield]
        ];

        stats.forEach(([label, key, value]) => {
            const row = this.statRows[label];
            const activeValue = activeShip.stats[key] || 1;
            const delta = value - activeValue;
            row.bar.width = row.maxWidth * Phaser.Math.Clamp(value / 1.8, 0.08, 1);
            row.bar.setFillStyle(COLORS.cyan, 1);
            row.delta.setText(
                Math.abs(delta) < 0.015
                    ? "—"
                    : `${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`
            );
            row.delta.setColor(
                delta > 0.015
                    ? "#86EFAC"
                    : delta < -0.015
                        ? "#FCA5A5"
                        : "#64859A"
            );
        });

        if (selected) {
            this.priceText.setText("ACTIVE FLEET CRAFT");
            this.setAction("SELECTED", false, COLORS.green, "#4DFFB8");
        } else if (owned) {
            this.priceText.setText("OWNED");
            this.setAction("SELECT SHIP", true, COLORS.green, "#4DFFB8");
        } else if (lockedByLevel) {
            this.priceText.setText(`REQUIRES LEVEL ${ship.unlockLevel}`);
            this.setAction("LOCKED", false, COLORS.muted, "#64859A");
        } else {
            this.priceText.setText(`◈ ${ship.price.toLocaleString("en-US")}`);
            this.setAction("PURCHASE", true, COLORS.gold, "#FFD166");
        }

        this.creditsTop.setText(`◈ ${this.saveManager.getCredits().toLocaleString("en-US")}`);

        if (animate) {
            this.tweens.killTweensOf(this.shipImage);
            this.tweens.add({
                targets: this.shipImage,
                alpha: { from: 0.08, to: 1 },
                duration: 180,
                ease: "Quad.easeOut"
            });
        }
    }

    setAction(text, enabled, accent, accentHex) {
        const button = this.actionButton;
        button.enabled = enabled;
        button.accentHex = accentHex;
        button.label.setText(text);
        button.rail.setFillStyle(accent, enabled ? 1 : 0.35);
        button.line.setFillStyle(accent, enabled ? 0.35 : 0.14);
        button.glow.setFillStyle(accent, enabled ? 0.055 : 0.018);
        button.arrow.setColor(accentHex);
        button.setAlpha(enabled ? 1 : 0.55);
        enabled
            ? button.hit.setInteractive({ useHandCursor: true })
            : button.hit.disableInteractive();
    }

    handleAction() {
        if (this.busy) return;

        const ship = SHIP_CATALOG[this.currentIndex];
        const owned = this.saveManager.ownsShip(ship.id);

        if (owned) {
            if (this.saveManager.getSelectedShip() === ship.id) return;
            this.saveManager.selectShip(ship.id);
            this.soundManager.sfx("powerup", 0.6);
            this.cameras.main.flash(120, 52, 216, 255, false);
            this.refresh();
            return;
        }

        if (this.xpManager.getLevel() < ship.unlockLevel) return;

        if (this.saveManager.spendCredits(ship.price)) {
            this.saveManager.unlockShip(ship.id);
            this.saveManager.selectShip(ship.id);
            this.soundManager.sfx("powerup", 0.8);
            this.cameras.main.flash(180, 255, 210, 70, false);
            this.refresh();
        } else {
            this.soundManager.sfx("hit", 0.35);
            this.tweens.add({
                targets: this.creditsTop,
                x: this.creditsTop.x - 8,
                duration: 45,
                yoyo: true,
                repeat: 3
            });
        }
    }

    goBack() {
        if (this.busy) return;
        this.busy = true;
        this.soundManager.sfx("button", 0.4);
        this.cameras.main.fadeOut(220, 0, 4, 10);
        this.time.delayedCall(220, () => this.scene.start("MenuScene"));
    }

    fitAsset(image, maxWidth, maxHeight) {
        const source = image.texture.getSourceImage();
        const sourceWidth = source?.width || image.width || 1;
        const sourceHeight = source?.height || image.height || 1;
        image.setScale(Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight));
    }

    fitShip(image, maxWidth, maxHeight) {
        const source = image.texture.getSourceImage();
        const sourceWidth = source?.width || image.width || 1;
        const sourceHeight = source?.height || image.height || 1;
        const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
        image.setScale(scale);
    }

    getRarityColor(rarity) {
        const colors = {
            COMMON: "#94A3B8",
            RARE: "#38BDF8",
            EPIC: "#A78BFA",
            LEGENDARY: "#FACC15",
            MYTHIC: "#F97316",
            ULTIMATE: "#EF4444"
        };
        return colors[String(rarity).toUpperCase()] || "#94A3B8";
    }
}