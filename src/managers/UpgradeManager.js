import Phaser from "phaser";

export default class UpgradeManager {
    constructor(scene) {
        this.scene = scene;

        this.upgrades = scene.registry.get("playerUpgrades") || {
            shieldBonus: 0,
            fireRateBonus: 0,
            tripleLaser: false,
            damageBonus: 0,
            extraHearts: 0,
            pickupRangeBonus: 0,
            doubleLaserDurationBonus: 0
        };

        scene.registry.set("playerUpgrades", this.upgrades);
    }

    getExtraHearts() {
        return this.upgrades.extraHearts;
    }

    getShieldBonus() {
        return this.upgrades.shieldBonus;
    }

    getShieldHits() {
        return 3 + this.upgrades.shieldBonus;
    }

    hasTripleLaser() {
        return this.upgrades.tripleLaser;
    }

    hasTripleShot() {
        return this.upgrades.tripleLaser;
    }

    getDamageAmount() {
        return 1 + this.upgrades.damageBonus;
    }

    getBulletDamage() {
        return this.getDamageAmount();
    }

    getFireDelay(baseDelay = 180) {
        const multiplier = Math.max(0.45, 1 - this.upgrades.fireRateBonus);
        return baseDelay * multiplier;
    }

    getFireRate() {
        return this.getFireDelay(180);
    }

    getPickupRange() {
        return 55 + this.upgrades.pickupRangeBonus;
    }

    getDoubleLaserDurationBonus() {
        return this.upgrades.doubleLaserDurationBonus;
    }

    applyUpgrade(id) {
        if (id === "shield_capacity") {
            this.upgrades.shieldBonus += 2;
        }

        if (id === "rapid_fire") {
            this.upgrades.fireRateBonus += 0.2;
        }

        if (id === "triple_laser") {
            this.upgrades.tripleLaser = true;
        }

        if (id === "damage_boost") {
            this.upgrades.damageBonus += 1;
        }

        if (id === "extra_heart") {
            this.upgrades.extraHearts += 1;
            this.scene.playerHP += 1;
            this.scene.hud.updateHP(this.scene.playerHP);
        }

        if (id === "magnet_field") {
            this.upgrades.pickupRangeBonus += 35;
        }

        if (id === "extended_double") {
            this.upgrades.doubleLaserDurationBonus += 10000;
        }

        this.scene.registry.set("playerUpgrades", this.upgrades);
    }

    pickRandomOptions(count = 3) {
        const pool = [
            {
                id: "shield_capacity",
                title: "REINFORCED SHIELD",
                desc: "+2 shield hits",
                color: "#22c55e"
            },
            {
                id: "rapid_fire",
                title: "RAPID FIRE",
                desc: "+20% fire speed",
                color: "#facc15"
            },
            {
                id: "triple_laser",
                title: "TRIPLE LASER",
                desc: "Permanent triple shots",
                color: "#38BDF8"
            },
            {
                id: "damage_boost",
                title: "DAMAGE BOOST",
                desc: "+1 laser damage",
                color: "#fb7185"
            },
            {
                id: "extra_heart",
                title: "EXTRA HEART",
                desc: "+1 permanent heart",
                color: "#ff4444"
            },
            {
                id: "magnet_field",
                title: "MAGNET FIELD",
                desc: "Larger pickup range",
                color: "#a78bfa"
            },
            {
                id: "extended_double",
                title: "EXTENDED DOUBLE",
                desc: "+10 sec double laser",
                color: "#06b6d4"
            }
        ];

        const availablePool = pool.filter((upgrade) => {
            if (upgrade.id === "triple_laser" && this.upgrades.tripleLaser) {
                return false;
            }

            return true;
        });

        Phaser.Utils.Array.Shuffle(availablePool);
        return availablePool.slice(0, count);
    }

    openUpgradeSelection(onComplete) {
        this.showUpgradeSelection(onComplete);
    }

    showUpgradeSelection(onComplete) {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        this.scene.isUpgradeChoosing = true;

        const items = [];

        const overlay = this.scene.add.rectangle(
            centerX,
            centerY,
            this.scene.scale.width,
            this.scene.scale.height,
            0x020617,
            0.86
        ).setDepth(200);

        const title = this.scene.add.text(centerX, centerY - 190, "CHOOSE UPGRADE", {
            fontSize: "48px",
            color: "#38BDF8",
            fontStyle: "bold",
            stroke: "#020617",
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(201);

        const subtitle = this.scene.add.text(centerX, centerY - 140, "Select one reward before Stage 2", {
            fontSize: "20px",
            color: "#CBD5E1",
            stroke: "#020617",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(201);

        items.push(overlay, title, subtitle);

        this.pickRandomOptions(3).forEach((option, index) => {
            const cardX = centerX + (index - 1) * 250;
            const cardY = centerY + 20;
            const colorValue = Phaser.Display.Color.HexStringToColor(option.color).color;

            const card = this.scene.add.rectangle(
                cardX,
                cardY,
                220,
                240,
                0x0f172a,
                0.96
            ).setStrokeStyle(3, colorValue, 0.85).setDepth(201);

            const icon = this.scene.add.circle(
                cardX,
                cardY - 70,
                34,
                colorValue,
                0.8
            ).setDepth(202);

            const name = this.scene.add.text(cardX, cardY - 15, option.title, {
                fontSize: "20px",
                color: option.color,
                fontStyle: "bold",
                align: "center",
                stroke: "#020617",
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(202);

            const desc = this.scene.add.text(cardX, cardY + 35, option.desc, {
                fontSize: "18px",
                color: "#E2E8F0",
                align: "center",
                stroke: "#020617",
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(202);

            const select = this.scene.add.text(cardX, cardY + 90, "SELECT", {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(202);

            card.setInteractive({ useHandCursor: true });

            card.on("pointerover", () => {
                card.setScale(1.05);
                card.setStrokeStyle(4, 0xffffff, 1);
            });

            card.on("pointerout", () => {
                card.setScale(1);
                card.setStrokeStyle(3, colorValue, 0.85);
            });

            card.on("pointerdown", () => {
                this.applyUpgrade(option.id);

                items.forEach((item) => {
                    if (item?.active) item.destroy();
                });

                this.scene.isUpgradeChoosing = false;

                if (onComplete) {
                    onComplete();
                }
            });

            items.push(card, icon, name, desc, select);
        });
    }
}