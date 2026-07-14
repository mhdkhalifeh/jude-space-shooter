import Phaser from "phaser";

export default class HUDManager {
    constructor(scene) {
        this.scene = scene;

        this.scoreContainer = null;
        this.scoreText = null;

        this.hpContainer = null;
        this.hearts = [];

        this.missionContainer = null;
        this.stageText = null;
        this.waveText = null;

        this.weaponContainer = null;
        this.weaponText = null;
        this.weaponBarBg = null;
        this.weaponBar = null;

        this.shieldContainer = null;
        this.shieldText = null;

        this.lastStage = null;
        this.lastWave = null;
        this.lastShieldHits = null;

        this.isMobile =
            this.scene.sys.game.device.input.touch ||
            window.innerWidth <= 900;
    }

    create() {
        this.createScore();
        this.createHealth();
        this.createMissionStatus();
        this.createWeaponStatus();
        this.createShieldStatus();

        this.scene.events.on("update", this.update, this);

        this.scene.events.once("shutdown", () => {
            this.scene.events.off("update", this.update, this);
        });
    }

    createScore() {
        const x = 24;
        const y = 20;

        this.scoreContainer = this.scene.add.container(x, y)
            .setDepth(1000)
            .setScrollFactor(0);

        const glow = this.scene.add.rectangle(
            0,
            0,
            this.isMobile ? 185 : 215,
            52,
            0x020617,
            0.68
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x38bdf8, 0.55);

        const label = this.scene.add.text(
            14,
            7,
            "SCORE",
            {
                fontSize: this.isMobile ? "10px" : "11px",
                color: "#7DD3FC",
                fontStyle: "bold",
                letterSpacing: 2
            }
        );

        this.scoreText = this.scene.add.text(
            14,
            22,
            "000000",
            {
                fontSize: this.isMobile ? "21px" : "24px",
                color: "#FFFFFF",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 4
            }
        );

        this.scoreContainer.add([
            glow,
            label,
            this.scoreText
        ]);
    }

    createHealth() {
        const width = this.scene.scale.width;

        this.hpContainer = this.scene.add.container(
            width - (this.isMobile ? 175 : 195),
            28
        )
            .setDepth(1000)
            .setScrollFactor(0);

        const label = this.scene.add.text(
            0,
            -12,
            "HULL",
            {
                fontSize: this.isMobile ? "10px" : "11px",
                color: "#FCA5A5",
                fontStyle: "bold",
                letterSpacing: 2
            }
        );

        this.hpContainer.add(label);

        for (let i = 0; i < 3; i++) {
            const heart = this.scene.add.text(
                26 + i * (this.isMobile ? 42 : 48),
                8,
                "♥",
                {
                    fontSize: this.isMobile ? "25px" : "29px",
                    color: "#EF4444",
                    fontStyle: "bold",
                    stroke: "#450A0A",
                    strokeThickness: 4
                }
            ).setOrigin(0.5);

            this.hearts.push(heart);
            this.hpContainer.add(heart);
        }
    }

    createMissionStatus() {
        const centerX = this.scene.scale.width / 2;

        this.missionContainer = this.scene.add.container(
            centerX,
            this.isMobile ? 32 : 34
        )
            .setDepth(1000)
            .setScrollFactor(0);

        const background = this.scene.add.rectangle(
            0,
            0,
            this.isMobile ? 240 : 285,
            40,
            0x020617,
            0.52
        )
            .setStrokeStyle(1, 0xa78bfa, 0.4);

        this.stageText = this.scene.add.text(
            this.isMobile ? -52 : -62,
            0,
            "STAGE 1",
            {
                fontSize: this.isMobile ? "14px" : "16px",
                color: "#C4B5FD",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        const divider = this.scene.add.rectangle(
            0,
            0,
            1,
            22,
            0xffffff,
            0.2
        );

        this.waveText = this.scene.add.text(
            this.isMobile ? 52 : 62,
            0,
            "WAVE 1",
            {
                fontSize: this.isMobile ? "14px" : "16px",
                color: "#67E8F9",
                fontStyle: "bold",
                stroke: "#020617",
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        this.missionContainer.add([
            background,
            this.stageText,
            divider,
            this.waveText
        ]);
    }

    createWeaponStatus() {
        const x = 24;
        const y = 78;

        this.weaponContainer = this.scene.add.container(x, y)
            .setDepth(1000)
            .setScrollFactor(0)
            .setVisible(false);

        const background = this.scene.add.rectangle(
            0,
            0,
            this.isMobile ? 190 : 220,
            48,
            0x020617,
            0.68
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x38bdf8, 0.55);

        this.weaponText = this.scene.add.text(
            12,
            7,
            "",
            {
                fontSize: this.isMobile ? "12px" : "14px",
                color: "#BAE6FD",
                fontStyle: "bold"
            }
        );

        this.weaponBarBg = this.scene.add.rectangle(
            12,
            34,
            this.isMobile ? 164 : 192,
            6,
            0x0f172a,
            1
        ).setOrigin(0, 0.5);

        this.weaponBar = this.scene.add.rectangle(
            12,
            34,
            this.isMobile ? 164 : 192,
            6,
            0x38bdf8,
            1
        ).setOrigin(0, 0.5);

        this.weaponContainer.add([
            background,
            this.weaponText,
            this.weaponBarBg,
            this.weaponBar
        ]);
    }

    createShieldStatus() {
        const x = 24;
        const y = this.scene.scale.height - 56;

        this.shieldContainer = this.scene.add.container(x, y)
            .setDepth(1000)
            .setScrollFactor(0)
            .setVisible(false);

        const background = this.scene.add.rectangle(
            0,
            0,
            this.isMobile ? 155 : 175,
            38,
            0x052e2b,
            0.72
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x22c55e, 0.65);

        const icon = this.scene.add.text(
            10,
            7,
            "⬡",
            {
                fontSize: this.isMobile ? "19px" : "21px",
                color: "#86EFAC",
                fontStyle: "bold"
            }
        );

        this.shieldText = this.scene.add.text(
            42,
            10,
            "SHIELD x3",
            {
                fontSize: this.isMobile ? "12px" : "14px",
                color: "#DCFCE7",
                fontStyle: "bold"
            }
        );

        this.shieldContainer.add([
            background,
            icon,
            this.shieldText
        ]);
    }

    update() {
        this.updateMissionStatus();
        this.updateShieldStatus();
    }

    updateMissionStatus() {
        const stage =
            this.scene.waveManager?.stage ||
            this.scene.registry.get("currentStage") ||
            1;

        const wave =
            this.scene.waveManager?.wave ||
            1;

        if (stage !== this.lastStage) {
            this.lastStage = stage;
            this.stageText?.setText(`STAGE ${stage}`);
        }

        if (wave !== this.lastWave) {
            this.lastWave = wave;
            this.waveText?.setText(`WAVE ${wave}`);
        }
    }

    updateShieldStatus() {
        const shieldHits =
            this.scene.powerUpManager?.shieldHits || 0;

        if (shieldHits === this.lastShieldHits) return;

        this.lastShieldHits = shieldHits;

        this.shieldContainer?.setVisible(shieldHits > 0);
        this.shieldText?.setText(`SHIELD x${shieldHits}`);

        if (shieldHits > 0) {
            this.scene.tweens.add({
                targets: this.shieldContainer,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 100,
                yoyo: true
            });
        }
    }

    updateScore(score) {
        if (!this.scoreText) return;

        this.scoreText.setText(
            String(score).padStart(6, "0")
        );

        this.scene.tweens.add({
            targets: this.scoreText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 70,
            yoyo: true
        });
    }

    updateHP(hp) {
        this.hearts.forEach((heart, index) => {
            const active = index < hp;

            heart.setColor(
                active ? "#EF4444" : "#334155"
            );

            heart.setAlpha(
                active ? 1 : 0.4
            );
        });

        if (hp >= 0 && hp < this.hearts.length) {
            const damagedHeart = this.hearts[hp];

            if (damagedHeart) {
                this.scene.tweens.add({
                    targets: damagedHeart,
                    scaleX: 1.45,
                    scaleY: 1.45,
                    alpha: 0.2,
                    duration: 120,
                    yoyo: true
                });
            }
        }
    }

    showWeapon(name) {
        this.weaponText.setText(name);
        this.weaponContainer.setVisible(true);
    }

    updateWeaponBar(percent) {
        const value = Phaser.Math.Clamp(
            percent,
            0,
            1
        );

        const maxWidth =
            this.isMobile ? 164 : 192;

        this.weaponBar.width =
            maxWidth * value;

        if (value <= 0.25) {
            this.weaponBar.fillColor = 0xef4444;
        } else if (value <= 0.55) {
            this.weaponBar.fillColor = 0xfacc15;
        } else {
            this.weaponBar.fillColor = 0x38bdf8;
        }
    }

    hideWeapon() {
        this.weaponContainer.setVisible(false);
    }
}