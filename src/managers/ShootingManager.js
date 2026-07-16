import Bullet from "../entities/Bullet";
import EnemyBullet from "../entities/EnemyBullet";

export default class ShootingManager {
    constructor(scene) {
        this.scene = scene;

        this.lastShotTime = 0;
        this.lastLaserSfxTime = 0;

        this.isMobile =
            scene.sys.game.device.input.touch ||
            window.matchMedia("(pointer: coarse)").matches ||
            window.innerWidth <= 900;

        /*
         * الموبايل يطلق تلقائياً.
         * الكمبيوتر يبقى الضغط المستمر للإطلاق.
         */
        this.autoFireMobile = true;
        this.isFiring = this.isMobile;

        this.onPointerDown = () => {
            if (!this.isMobile) {
                this.isFiring = true;
            }
        };

        this.onPointerUp = () => {
            if (!this.isMobile) {
                this.isFiring = false;
            }
        };

        this.scene.input.on(
            "pointerdown",
            this.onPointerDown
        );

        this.scene.input.on(
            "pointerup",
            this.onPointerUp
        );

        this.scene.events.once(
            "shutdown",
            this.destroy,
            this
        );
    }

    update() {
        this.handlePlayerShooting();

        this.scene.bullets
            .getChildren()
            .forEach((bullet) => {
                if (bullet?.active) {
                    bullet.update();
                }
            });

        this.scene.enemyBullets
            .getChildren()
            .forEach((bullet) => {
                if (bullet?.active) {
                    bullet.update();
                }
            });
    }

    shouldFire() {
        if (
            this.scene.isGameOver ||
            this.scene.isPausedByMenu
        ) {
            return false;
        }

        if (
            !this.scene.player?.active
        ) {
            return false;
        }

        if (this.isMobile) {
            return this.autoFireMobile;
        }

        return this.isFiring;
    }

    handlePlayerShooting() {
        if (!this.shouldFire()) return;

        const mode =
            this.scene.powerUpManager
                .getWeaponMode();

        /*
         * Player هو مصدر بيانات المركبة الأساسي.
         * fallback للـ selectedShip لحماية التوافق القديم.
         */
        const shipConfig =
            this.scene.player?.shipConfig ||
            this.scene.selectedShip ||
            {};

        const shipFire =
            shipConfig.stats?.fireRate || 1;

        const baseDelay =
            (
                this.scene.upgradeManager
                    ?.getFireRate?.() ??
                180
            ) / shipFire;

        const fireRateMultiplier =
            this.scene.powerUpManager
                ?.getFireRateMultiplier?.() ??
            1;

        const fireDelay =
            baseDelay *
            fireRateMultiplier;

        if (
            this.scene.time.now <=
            this.lastShotTime +
                fireDelay
        ) {
            return;
        }

        const shipDamage =
            shipConfig.stats?.damage || 1;

        const powerDamageMultiplier =
            this.scene.powerUpManager
                ?.getDamageMultiplier?.() ??
            1;

        const baseDamage =
            (
                this.scene.upgradeManager
                    ?.getBulletDamage?.() ??
                1
            ) *
            shipDamage *
            powerDamageMultiplier;

        const triple =
            this.scene.upgradeManager
                ?.hasTripleShot?.() ??
            false;

        let fired = 0;

        if (mode === "spread") {
            [
                -220,
                -110,
                0,
                110,
                220
            ].forEach((velocityX) => {
                this.addBullet({
                    velocityX,
                    damage:
                        baseDamage * 0.8,
                    tint: 0xa78bfa,
                    scale: 0.075,
                    rotation:
                        velocityX * 0.0007
                });

                fired++;
            });
        } else if (
            mode === "railgun"
        ) {
            this.addBullet({
                damage:
                    baseDamage * 4,
                speed: 900,
                tint: 0xf97316,
                scale: 0.15,
                piercing: 5
            });

            fired = 1;
        } else if (
            mode === "homing"
        ) {
            [-18, 18].forEach(
                (offset) => {
                    this.addBullet({
                        offsetX: offset,
                        damage:
                            baseDamage * 1.2,
                        speed: 520,
                        tint: 0xfacc15,
                        scale: 0.085,
                        homing: true
                    });

                    fired++;
                }
            );
        } else {
            const doubleLaser =
                mode === "double";

            let offsets =
                doubleLaser
                    ? [-18, 18]
                    : [0];

            if (triple) {
                offsets =
                    doubleLaser
                        ? [
                              -38,
                              -18,
                              0,
                              18,
                              38
                          ]
                        : [-22, 0, 22];
            }

            offsets.forEach(
                (offset) => {
                    this.addBullet({
                        offsetX: offset,
                        damage:
                            baseDamage,
                        tint:
                            doubleLaser
                                ? 0x38bdf8
                                : 0xffffff
                    });

                    fired++;
                }
            );
        }

        this.scene.saveManager
            ?.addShotsFired(fired);

        this.playPlayerLaserSfx(
            mode
        );

        this.lastShotTime =
            this.scene.time.now;
    }

    addBullet(options = {}) {
        const bullet =
            new Bullet(
                this.scene,
                this.scene.player.x +
                    (options.offsetX || 0),
                this.scene.player.y - 45,
                options
            );

        this.scene.bullets.add(
            bullet
        );
    }

    playPlayerLaserSfx(mode) {
        if (
            !this.scene.soundManager
                ?.sfx
        ) {
            return;
        }

        if (
            this.scene.time.now <=
            this.lastLaserSfxTime + 80
        ) {
            return;
        }

        const volume =
            mode === "railgun"
                ? 0.42
                : mode === "spread"
                    ? 0.28
                    : 0.22;

        this.scene.soundManager.sfx(
            "laser",
            volume
        );

        this.lastLaserSfxTime =
            this.scene.time.now;
    }

    handleEnemyShooting(enemy) {
        if (
            !this.scene.player?.active ||
            !enemy.canShoot
        ) {
            return;
        }

        if (
            this.scene.time.now <
            (enemy.empUntil || 0)
        ) {
            return;
        }

        if (
            enemy.type === "fighter"
        ) {
            this.handleFighterShooting(
                enemy
            );
        }

        if (
            enemy.type === "elite"
        ) {
            this.handleEliteShooting(
                enemy
            );
        }

        if (
            enemy.type === "sniper"
        ) {
            this.handleSniperShooting(
                enemy
            );
        }

        if (
            enemy.type ===
            "heavy_cruiser"
        ) {
            this.handleHeavyShooting(
                enemy
            );
        }
    }

    handleFighterShooting(enemy) {
        if (
            this.scene.time.now <=
            (enemy.lastShotTime || 0) +
                1600
        ) {
            return;
        }

        this.fireEnemyAimed(
            enemy,
            0.2,
            0.06,
            260
        );

        enemy.lastShotTime =
            this.scene.time.now;
    }

    handleSniperShooting(enemy) {
        if (!enemy.sniperLocked) return;

        if (
            this.scene.time.now <=
            (enemy.lastShotTime || 0) +
                (enemy.stats
                    .shotCooldown ||
                    2100)
        ) {
            return;
        }

        const warning =
            this.scene.add
                .line(
                    0,
                    0,
                    enemy.x,
                    enemy.y,
                    this.scene.player.x,
                    this.scene.player.y,
                    0x60a5fa,
                    0.55
                )
                .setOrigin(0)
                .setDepth(7);

        this.scene.tweens.add({
            targets: warning,
            alpha: 0,
            duration: 380,
            onComplete: () =>
                warning.destroy()
        });

        this.scene.time.delayedCall(
            340,
            () => {
                if (
                    enemy.active &&
                    this.scene.player
                        ?.active
                ) {
                    this.fireEnemyAimed(
                        enemy,
                        0.34,
                        0.085,
                        430
                    );
                }
            }
        );

        enemy.lastShotTime =
            this.scene.time.now;
    }

    handleHeavyShooting(enemy) {
        if (
            this.scene.time.now <=
            (enemy.lastShotTime || 0) +
                (enemy.stats
                    .shotCooldown ||
                    1500)
        ) {
            return;
        }

        [-110, 0, 110].forEach(
            (offset) => {
                const bullet =
                    new EnemyBullet(
                        this.scene,
                        enemy.x,
                        enemy.y + 55,
                        this.scene.player.x +
                            offset,
                        this.scene.player.y
                    );

                bullet.setScale(
                    0.085
                );

                bullet.speed = 220;

                this.scene.enemyBullets
                    .add(bullet);
            }
        );

        this.scene.soundManager
            ?.sfx?.(
                "enemy_laser",
                0.32
            );

        enemy.lastShotTime =
            this.scene.time.now;
    }

    handleEliteShooting(enemy) {
        if (
            this.scene.time.now <=
            (enemy.lastShotTime || 0) +
                950
        ) {
            return;
        }

        this.fireEliteSpread(enemy);

        if (
            this.scene.time.now >=
            (enemy.lastHeavyShotTime ||
                0) +
                2600
        ) {
            this.fireEnemyAimed(
                enemy,
                0.3,
                0.11,
                300
            );

            enemy.lastHeavyShotTime =
                this.scene.time.now;
        }

        this.scene.soundManager
            ?.sfx?.(
                "enemy_laser",
                0.26
            );

        enemy.lastShotTime =
            this.scene.time.now;
    }

    fireEnemyAimed(
        enemy,
        volume = 0.2,
        scale = 0.06,
        speed = 260
    ) {
        const bullet =
            new EnemyBullet(
                this.scene,
                enemy.x,
                enemy.y + 40,
                this.scene.player.x,
                this.scene.player.y
            );

        bullet.setScale(scale);

        const angle =
            Math.atan2(
                bullet.velocityY,
                bullet.velocityX
            );

        bullet.speed = speed;

        bullet.velocityX =
            Math.cos(angle) * speed;

        bullet.velocityY =
            Math.sin(angle) * speed;

        this.scene.enemyBullets.add(
            bullet
        );

        this.scene.soundManager
            ?.sfx?.(
                "enemy_laser",
                volume
            );
    }

    fireEliteSpread(enemy) {
        [-78, 0, 78].forEach(
            (offset) => {
                const bullet =
                    new EnemyBullet(
                        this.scene,
                        enemy.x + offset,
                        enemy.y + 55,
                        enemy.x + offset,
                        this.scene.scale
                            .height + 200
                    );

                bullet.setScale(
                    0.075
                );

                this.scene.enemyBullets
                    .add(bullet);
            }
        );
    }

    destroy() {
        if (!this.scene?.input) return;

        this.scene.input.off(
            "pointerdown",
            this.onPointerDown
        );

        this.scene.input.off(
            "pointerup",
            this.onPointerUp
        );
    }
}