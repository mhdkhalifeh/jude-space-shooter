import Phaser from "phaser";
import SaveManager from "../managers/SaveManager";
import XPManager from "../managers/XPManager";
import SoundManager from "../managers/SoundManager";
import { SHIP_CATALOG, getShipById } from "../config/ShipCatalog";
import { UITheme, addSciFiPanel } from "../theme/UITheme";

export default class HangarScene extends Phaser.Scene {
    constructor() {
        super("HangarScene");
    }

    create() {
        const { width, height } = this.scale;

        this.saveManager = new SaveManager(this);
        this.xpManager = new XPManager(this);
        this.soundManager = new SoundManager(this);
        this.currentIndex = Math.max(
            0,
            SHIP_CATALOG.findIndex((ship) => ship.id === this.saveManager.getSelectedShip())
        );

        this.cameras.main.setBackgroundColor("#020617");
        this.add.image(width / 2, height / 2, "background_space")
            .setDisplaySize(width, height)
            .setAlpha(0.46);
        this.add.rectangle(width / 2, height / 2, width, height, 0x020617, 0.78);

        this.createHangarFloor(width, height);
        this.createHeader(width);
        this.createShipViewer(width, height);
        this.createDetailsPanel(width, height);
        this.createNavigation(width, height);
        this.refresh();

        this.input.keyboard.on("keydown-LEFT", () => this.changeShip(-1));
        this.input.keyboard.on("keydown-RIGHT", () => this.changeShip(1));
        this.input.keyboard.on("keydown-ESC", () => this.scene.start("MenuScene"));
    }

    createHangarFloor(width, height) {
        const floorY = height * 0.74;
        for (let i = -7; i <= 7; i++) {
            this.add.line(
                width / 2,
                floorY,
                i * 95,
                0,
                i * 180,
                height * 0.35,
                0x38bdf8,
                0.13
            ).setOrigin(0.5, 0);
        }

        for (let i = 0; i < 7; i++) {
            this.add.ellipse(
                width / 2,
                floorY + i * 38,
                280 + i * 155,
                44 + i * 9,
                0x000000,
                0
            ).setStrokeStyle(1, 0x38bdf8, Math.max(0.03, 0.2 - i * 0.025));
        }

        this.platformGlow = this.add.ellipse(
            width * 0.39,
            height * 0.69,
            370,
            92,
            0x38bdf8,
            0.1
        ).setStrokeStyle(3, 0x7dd3fc, 0.55);
    }

    createHeader(width) {
        this.add.text(42, 35, "JUDE // FLEET COMMAND", {
            ...UITheme.text.mono,
            fontSize: "15px",
            color: "#7DD3FC",
            letterSpacing: 3
        });

        this.add.text(42, 59, "HANGAR", {
            ...UITheme.text.title,
            fontSize: "46px",
            color: "#FFFFFF",
            letterSpacing: 2
        });

        const credits = this.saveManager.getCredits();
        this.creditsText = this.add.text(width - 42, 52, `◈ ${credits.toLocaleString("en-US")}`, {
            ...UITheme.text.mono,
            fontSize: "24px",
            color: "#FACC15"
        }).setOrigin(1, 0.5);
    }

    createShipViewer(width, height) {
        this.shipContainer = this.add.container(width * 0.39, height * 0.44);

        this.shipShadow = this.add.ellipse(0, 150, 270, 55, 0x000000, 0.55);
        this.shipGlow = this.add.ellipse(0, 40, 290, 300, 0x38bdf8, 0.055);
        this.shipImage = this.add.image(0, 0, "player").setScale(0.36);
        this.shipReflection = this.add.image(0, 170, "player")
            .setScale(0.22, -0.08)
            .setAlpha(0.12);

        this.engineParticles = this.add.group();
        for (let i = 0; i < 18; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(-65, 65),
                Phaser.Math.Between(105, 195),
                Phaser.Math.FloatBetween(1.5, 4),
                0x38bdf8,
                Phaser.Math.FloatBetween(0.12, 0.55)
            );
            particle.baseX = particle.x;
            particle.speed = Phaser.Math.FloatBetween(0.25, 0.8);
            this.engineParticles.add(particle);
        }

        this.shipContainer.add([
            this.shipShadow,
            this.shipGlow,
            ...this.engineParticles.getChildren(),
            this.shipReflection,
            this.shipImage
        ]);

        this.tweens.add({
            targets: this.shipContainer,
            y: this.shipContainer.y - 12,
            duration: 1900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.tweens.add({
            targets: this.shipImage,
            angle: { from: -4.5, to: 4.5 },
            scaleX: { from: 0.30, to: 0.39 },
            scaleY: { from: 0.36, to: 0.355 },
            duration: 2800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.events.on("update", () => {
            this.engineParticles.getChildren().forEach((particle) => {
                particle.y += particle.speed;
                particle.alpha -= 0.004;
                if (particle.y > 210 || particle.alpha <= 0.03) {
                    particle.y = Phaser.Math.Between(100, 145);
                    particle.x = particle.baseX + Phaser.Math.Between(-14, 14);
                    particle.alpha = Phaser.Math.FloatBetween(0.18, 0.58);
                }
            });
        });
    }

    createDetailsPanel(width, height) {
        const panelX = width * 0.76;
        const panelY = height * 0.47;
        const panelW = Math.min(470, width * 0.38);
        const panelH = 500;

        this.detailsPanel = addSciFiPanel(
            this,
            panelX,
            panelY,
            panelW,
            panelH,
            { color: UITheme.colors.purple, alpha: 0.92, depth: 20 }
        );

        this.shipName = this.add.text(-panelW / 2 + 30, -205, "", {
            ...UITheme.text.title,
            fontSize: "32px",
            color: "#FFFFFF"
        });
        this.shipClass = this.add.text(-panelW / 2 + 30, -164, "", {
            ...UITheme.text.mono,
            fontSize: "13px",
            color: "#7DD3FC",
            letterSpacing: 2
        });
        this.rarityText = this.add.text(panelW / 2 - 30, -202, "", {
            ...UITheme.text.mono,
            fontSize: "12px",
            color: "#FACC15"
        }).setOrigin(1, 0);
        this.description = this.add.text(-panelW / 2 + 30, -118, "", {
            ...UITheme.text.body,
            fontSize: "17px",
            color: "#CBD5E1",
            wordWrap: { width: panelW - 60, useAdvancedWrap: true },
            lineSpacing: 4
        });

        this.abilityText = this.add.text(-panelW / 2 + 30, -63, "", {
            ...UITheme.text.mono,
            fontSize: "12px",
            color: "#FACC15",
            letterSpacing: 1
        });

        this.comparisonText = this.add.text(panelW / 2 - 30, -63, "VS ACTIVE", {
            ...UITheme.text.mono,
            fontSize: "10px",
            color: "#64748B"
        }).setOrigin(1, 0);

        this.statRows = {};
        const rows = ["DAMAGE", "FIRE RATE", "SPEED", "SHIELD"];
        rows.forEach((label, index) => {
            const y = -18 + index * 56;
            const text = this.add.text(-panelW / 2 + 30, y, label, {
                ...UITheme.text.mono,
                fontSize: "12px",
                color: "#94A3B8",
                letterSpacing: 1
            });
            const bg = this.add.rectangle(-panelW / 2 + 145, y + 6, panelW - 205, 8, 0x111827, 1)
                .setOrigin(0, 0.5);
            const bar = this.add.rectangle(-panelW / 2 + 145, y + 6, 100, 8, 0x38bdf8, 1)
                .setOrigin(0, 0.5);
            const delta = this.add.text(panelW / 2 - 30, y + 6, "", {
                ...UITheme.text.mono,
                fontSize: "10px",
                color: "#94A3B8"
            }).setOrigin(1, 0.5);
            this.detailsPanel.add([text, bg, bar, delta]);
            this.statRows[label] = { bar, delta, maxWidth: panelW - 205 };
        });

        this.priceText = this.add.text(-panelW / 2 + 30, 212, "", {
            ...UITheme.text.mono,
            fontSize: "19px",
            color: "#FACC15"
        });

        this.actionButton = this.createActionButton(0, 208, panelW - 180, 54);

        this.detailsPanel.add([
            this.shipName,
            this.shipClass,
            this.rarityText,
            this.description,
            this.abilityText,
            this.comparisonText,
            this.priceText,
            this.actionButton
        ]);
    }

    createActionButton(x, y, width, height) {
        const container = this.add.container(x, y).setSize(width, height);
        const bg = this.add.rectangle(0, 0, width, height, 0x0f2f2a, 0.96)
            .setStrokeStyle(2, 0x22c55e, 0.9);
        const label = this.add.text(0, 0, "SELECT", {
            ...UITheme.text.mono,
            fontSize: "18px",
            color: "#FFFFFF"
        }).setOrigin(0.5);
        container.add([bg, label]);
        container.bg = bg;
        container.label = label;
        container.setInteractive({ useHandCursor: true });
        container.on("pointerover", () => container.setScale(1.035));
        container.on("pointerout", () => container.setScale(1));
        container.on("pointerdown", () => this.handleAction());
        return container;
    }

    createNavigation(width, height) {
        this.leftButton = this.createNavButton(width * 0.18, height * 0.48, "‹", () => this.changeShip(-1));
        this.rightButton = this.createNavButton(width * 0.58, height * 0.48, "›", () => this.changeShip(1));

        const back = this.add.text(42, height - 38, "← BACK TO COMMAND", {
            ...UITheme.text.mono,
            fontSize: "16px",
            color: "#CBD5E1"
        }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
        back.on("pointerover", () => back.setColor("#7DD3FC"));
        back.on("pointerout", () => back.setColor("#CBD5E1"));
        back.on("pointerdown", () => this.scene.start("MenuScene"));

        this.counterText = this.add.text(width * 0.39, height - 42, "", {
            ...UITheme.text.mono,
            fontSize: "13px",
            color: "#64748B"
        }).setOrigin(0.5, 1);
    }

    createNavButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: UITheme.fonts.title,
            fontSize: "68px",
            color: "#7DD3FC",
            stroke: "#020617",
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on("pointerover", () => btn.setScale(1.14).setColor("#FACC15"));
        btn.on("pointerout", () => btn.setScale(1).setColor("#7DD3FC"));
        btn.on("pointerdown", callback);
        return btn;
    }

    changeShip(direction) {
        this.soundManager.sfx("button", 0.35);
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

        this.shipImage.clearTint().setTexture(ship.texture);
        this.shipReflection.clearTint().setTexture(ship.texture);
        this.shipGlow.setFillStyle(ship.tint, 0.055);
        this.platformGlow.setStrokeStyle(3, ship.tint, 0.58);

        this.shipName.setText(ship.name);
        this.shipClass.setText(ship.className);
        this.rarityText.setText(ship.rarity);
        this.description.setText(ship.description);
        this.abilityText.setText(`SIGNATURE // ${ship.ability || "STANDARD FRAME"}`);
        this.counterText.setText(`${this.currentIndex + 1} / ${SHIP_CATALOG.length}`);

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
            row.bar.fillColor = ship.tint || 0x38bdf8;
            row.delta.setText(Math.abs(delta) < 0.015 ? "—" : `${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`);
            row.delta.setColor(delta > 0.015 ? "#86EFAC" : delta < -0.015 ? "#FCA5A5" : "#64748B");
        });

        if (selected) {
            this.priceText.setText("ACTIVE FLEET CRAFT");
            this.setAction("SELECTED", false, 0x164e3e, 0x22c55e);
        } else if (owned) {
            this.priceText.setText("OWNED");
            this.setAction("SELECT SHIP", true, 0x0f2f2a, 0x22c55e);
        } else if (lockedByLevel) {
            this.priceText.setText(`REQUIRES LEVEL ${ship.unlockLevel}`);
            this.setAction("LOCKED", false, 0x1f2937, 0x475569);
        } else {
            this.priceText.setText(`◈ ${ship.price.toLocaleString("en-US")}`);
            this.setAction("PURCHASE", true, 0x3a2507, 0xfacc15);
        }

        this.creditsText.setText(`◈ ${this.saveManager.getCredits().toLocaleString("en-US")}`);

        if (animate) {
            this.tweens.add({
                targets: this.shipContainer,
                alpha: { from: 0.15, to: 1 },
                scaleX: { from: 0.86, to: 1 },
                scaleY: { from: 0.86, to: 1 },
                duration: 260,
                ease: "Back.easeOut"
            });
        }
    }

    setAction(text, enabled, color, border) {
        this.actionButton.label.setText(text);
        this.actionButton.bg.setFillStyle(color, 0.96).setStrokeStyle(2, border, 0.9);
        enabled ? this.actionButton.setInteractive({ useHandCursor: true }) : this.actionButton.disableInteractive();
        this.actionButton.setAlpha(enabled ? 1 : 0.58);
    }

    handleAction() {
        const ship = SHIP_CATALOG[this.currentIndex];
        const owned = this.saveManager.ownsShip(ship.id);

        if (owned) {
            this.saveManager.selectShip(ship.id);
            this.soundManager.sfx("powerup", 0.6);
            this.refresh();
            return;
        }

        if (this.xpManager.getLevel() < ship.unlockLevel) return;

        if (this.saveManager.spendCredits(ship.price)) {
            this.saveManager.unlockShip(ship.id);
            this.saveManager.selectShip(ship.id);
            this.soundManager.sfx("powerup", 0.8);
            this.cameras.main.flash(180, 255, 210, 70);
            this.refresh();
        } else {
            this.soundManager.sfx("hit", 0.35);
            this.tweens.add({
                targets: this.creditsText,
                x: this.creditsText.x - 8,
                duration: 45,
                yoyo: true,
                repeat: 3
            });
        }
    }
}
