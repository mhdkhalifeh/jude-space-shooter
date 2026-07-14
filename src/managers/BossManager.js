import Phaser from "phaser";
import BossAlpha from "../bosses/BossAlpha";
import BossOmega from "../bosses/BossOmega";
import BossLeviathan from "../bosses/BossLeviathan";

export default class BossManager {
    constructor(scene) {
        this.scene = scene;
        this.activeBoss = null;
        this.bossHpBg = null;
        this.bossHpBar = null;
        this.bossNameText = null;
        this.currentBossKey = null;
    }

    update() {
        if (!this.activeBoss) return;

        this.activeBoss.update();
        this.updateBossHUD();
    }

    startBossAlpha() {
        this.startBoss({
            key: "alpha",
            name: "ALPHA DREADNOUGHT",
            color: "#ff4444",
            classRef: BossAlpha,
            y: -260
        });
    }

    startBossOmega() {
        this.startBoss({
            key: "omega",
            name: "OMEGA SIEGE CRUISER",
            color: "#A78BFA",
            classRef: BossOmega,
            y: -300
        });
    }

    startBossLeviathan() {
        this.startBoss({
            key: "leviathan",
            name: "LEVIATHAN NEBULA BEAST",
            color: "#22C55E",
            classRef: BossLeviathan,
            y: -320
        });
    }

    startBoss(config) {
        if (this.activeBoss) return;

        this.currentBossKey = config.key;

        this.showWarning(
            config.name,
            config.color,
            () => {
                const boss =
                    new config.classRef(
                        this.scene,
                        this.scene.scale.width / 2,
                        config.y
                    );

                this.activeBoss = boss;

                this.createBossHUD(
                    config.name,
                    config.color
                );

                this.scene.powerUpManager
                    .spawnReward(
                        this.scene.scale.width /
                            2 -
                            80,
                        170,
                        "shield"
                    );

                this.scene.powerUpManager
                    .spawnReward(
                        this.scene.scale.width /
                            2 +
                            80,
                        170,
                        "double"
                    );
            }
        );
    }

    showWarning(
        bossName,
        color,
        onComplete
    ) {
        this.scene.soundManager?.sfx(
            "warning",
            0.8
        );

        this.scene.cameras.main.flash(
            250,
            255,
            0,
            0
        );

        this.scene.cameras.main.shake(
            350,
            0.01
        );

        const warning =
            this.scene.add.text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2 -
                    35,
                "⚠ WARNING ⚠",
                {
                    fontSize: "56px",
                    color: "#ff3333",
                    fontStyle: "bold",
                    stroke: "#020617",
                    strokeThickness: 8
                }
            )
                .setOrigin(0.5)
                .setDepth(120);

        const name =
            this.scene.add.text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2 +
                    35,
                bossName,
                {
                    fontSize: "28px",
                    color,
                    fontStyle: "bold",
                    stroke: "#020617",
                    strokeThickness: 6
                }
            )
                .setOrigin(0.5)
                .setDepth(120);

        this.scene.tweens.add({
            targets: [warning, name],
            alpha: 0.15,
            duration: 180,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                warning.destroy();
                name.destroy();
                onComplete();
            }
        });
    }

    createBossHUD(
        name,
        color = "#ff4444"
    ) {
        const width =
            this.scene.scale.width;

        this.bossNameText =
            this.scene.add.text(
                width / 2,
                82,
                name,
                {
                    fontSize: "22px",
                    color,
                    fontStyle: "bold",
                    stroke: "#020617",
                    strokeThickness: 4
                }
            )
                .setOrigin(0.5)
                .setDepth(110);

        this.bossHpBg =
            this.scene.add.rectangle(
                width / 2,
                114,
                520,
                16,
                0x450a0a,
                0.9
            ).setDepth(109);

        this.bossHpBar =
            this.scene.add.rectangle(
                width / 2 - 260,
                114,
                520,
                16,
                0x22c55e,
                1
            )
                .setOrigin(0, 0.5)
                .setDepth(110);
    }

    updateBossHUD() {
        if (
            !this.activeBoss ||
            !this.bossHpBar
        ) return;

        const percent = Math.max(
            0,
            this.activeBoss.hp /
                this.activeBoss.maxHp
        );

        this.bossHpBar.width =
            520 * percent;

        if (percent <= 0.35) {
            this.bossHpBar.fillColor =
                0xff3333;
        } else if (percent <= 0.7) {
            this.bossHpBar.fillColor =
                0xfacc15;
        } else {
            this.bossHpBar.fillColor =
                0x22c55e;
        }
    }

    damageBoss(bullet) {
        if (
            !this.activeBoss ||
            this.activeBoss.isDead
        ) return false;

        if (!bullet?.active) return false;

        bullet.destroy();

        this.scene.soundManager?.sfx(
            "hit",
            0.35
        );

        const damage =
            this.scene.upgradeManager
                ?.getBulletDamage?.() ?? 1;

        this.scene.effects.hitFreeze(22);

        this.scene.effects.showDamage(
            this.activeBoss.x,
            this.activeBoss.y + 20,
            damage
        );

        const isDead =
            this.activeBoss
                .takeDamage(damage);

        if (isDead) {
            this.killBoss();
        }

        return true;
    }

    killBoss() {
        if (!this.activeBoss) return;

        const bossKey =
            this.currentBossKey ||
            "alpha";

        const x = this.activeBoss.x;
        const y = this.activeBoss.y;

        const score =
            this.activeBoss.score ||
            1000;

        this.scene.soundManager?.sfx(
            "explosion",
            0.75
        );

        this.activeBoss.destroy();
        this.activeBoss = null;

        this.destroyBossHUD();
        this.scene.addScore(score);

        this.scene.saveManager
            ?.addBossKill(bossKey);

        this.scene
            .achievementManager
            ?.check();

        for (let i = 0; i < 18; i++) {
            this.scene.time.delayedCall(
                i * 105,
                () => {
                    const ex =
                        x +
                        Phaser.Math.Between(
                            -190,
                            190
                        );

                    const ey =
                        y +
                        Phaser.Math.Between(
                            -120,
                            145
                        );

                    this.scene.effects
                        .createExplosion(
                            ex,
                            ey
                        );

                    this.scene.soundManager
                        ?.sfx(
                            "explosion",
                            0.35
                        );
                }
            );
        }

        this.scene.cameras.main.flash(
            500,
            255,
            80,
            80
        );

        this.scene.cameras.main.shake(
            850,
            0.016
        );

        this.scene.time.delayedCall(
            1500,
            () => {
                this.showStageClear(
                    bossKey
                );

                this.scene
                    .powerUpManager
                    .spawnReward(
                        x - 90,
                        y + 80,
                        "shield"
                    );

                this.scene
                    .powerUpManager
                    .spawnReward(
                        x,
                        y + 90,
                        "double"
                    );

                this.scene
                    .powerUpManager
                    .spawnReward(
                        x + 90,
                        y + 80,
                        "shield"
                    );
            }
        );
    }

    destroyBossHUD() {
        if (this.bossNameText) {
            this.bossNameText.destroy();
        }

        if (this.bossHpBg) {
            this.bossHpBg.destroy();
        }

        if (this.bossHpBar) {
            this.bossHpBar.destroy();
        }

        this.bossNameText = null;
        this.bossHpBg = null;
        this.bossHpBar = null;
    }

    showStageClear(
        bossKey = "alpha"
    ) {
        const centerX =
            this.scene.scale.width / 2;

        const centerY =
            this.scene.scale.height / 2;

        const stage =
            this.scene.waveManager?.stage ||
            1;

        const bossNames = {
            alpha:
                "ALPHA DREADNOUGHT DESTROYED",
            omega:
                "OMEGA SIEGE CRUISER DESTROYED",
            leviathan:
                "LEVIATHAN DESTROYED"
        };

        const bossBonuses = {
            alpha: 5000,
            omega: 10000,
            leviathan: 15000
        };

        const bossName =
            bossNames[bossKey] ||
            "BOSS DESTROYED";

        const bonus =
            bossBonuses[bossKey] ||
            5000;

        const overlay =
            this.scene.add.rectangle(
                centerX,
                centerY,
                this.scene.scale.width,
                this.scene.scale.height,
                0x020617,
                0.72
            ).setDepth(115);

        const title =
            this.scene.add.text(
                centerX,
                centerY - 95,
                `STAGE ${stage} CLEAR`,
                {
                    fontSize: "58px",
                    color:
                        stage === 2
                            ? "#A78BFA"
                            : "#38BDF8",
                    fontStyle: "bold",
                    stroke: "#020617",
                    strokeThickness: 8
                }
            )
                .setOrigin(0.5)
                .setDepth(120);

        const bossText =
            this.scene.add.text(
                centerX,
                centerY - 25,
                bossName,
                {
                    fontSize: "28px",
                    color:
                        bossKey === "omega"
                            ? "#A78BFA"
                            : bossKey ===
                              "leviathan"
                                ? "#22c55e"
                                : "#ff4444",
                    fontStyle: "bold",
                    stroke: "#020617",
                    strokeThickness: 5
                }
            )
                .setOrigin(0.5)
                .setDepth(120);

        const bonusText =
            this.scene.add.text(
                centerX,
                centerY + 35,
                `STAGE BONUS  +${bonus}`,
                {
                    fontSize: "30px",
                    color: "#facc15",
                    fontStyle: "bold",
                    stroke: "#020617",
                    strokeThickness: 5
                }
            )
                .setOrigin(0.5)
                .setDepth(120);

        const nextText =
            this.scene.add.text(
                centerX,
                centerY + 95,
                "UPGRADE SELECTION UNLOCKED",
                {
                    fontSize: "22px",
                    color: "#CBD5E1",
                    stroke: "#020617",
                    strokeThickness: 4
                }
            )
                .setOrigin(0.5)
                .setDepth(120);

        this.scene.addScore(bonus);

        this.scene.saveManager
            ?.updateProgress(
                stage,
                this.scene.waveManager
                    ?.wave || 1
            );

        this.scene
            .achievementManager
            ?.check();

        this.scene.time.delayedCall(
            3000,
            () => {
                overlay.destroy();
                title.destroy();
                bossText.destroy();
                bonusText.destroy();
                nextText.destroy();

                if (
                    this.scene
                        .upgradeManager
                        ?.openUpgradeSelection
                ) {
                    this.scene
                        .upgradeManager
                        .openUpgradeSelection(
                            () => {
                                this.scene
                                    .waveManager
                                    .resumeAfterBoss();
                            }
                        );
                } else {
                    this.scene
                        .waveManager
                        .resumeAfterBoss();
                }
            }
        );
    }
}