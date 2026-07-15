import Phaser from "phaser";

export default class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    update() {
        this.checkEnemyBulletHitsPlayer();
        this.checkEnemyHitsPlayer();

        this.checkBulletHitsAsteroid();
        this.checkAsteroidHitsPlayer();

        this.checkBulletHitsMine();
        this.checkMineHitsPlayer();
    }

    handleBulletEnemyCollision(
        bullet,
        enemy
    ) {
        if (this.scene.isGameOver) return;
        if (!bullet?.active || !enemy?.active) return;
        if (enemy.canBeHit === false) return;

        if (bullet.hitTargets?.has(enemy)) return;
        bullet.hitTargets?.add(enemy);

        const damage = Math.max(
            1,
            Math.round(
                bullet.damage ??
                (this.scene.upgradeManager?.getBulletDamage?.() ?? 1)
            )
        );

        if ((bullet.piercing || 0) > 0) {
            bullet.piercing -= 1;
        } else {
            bullet.destroy();
        }

        this.scene.effects.hitFreeze(45);

        this.scene.effects.showDamage(
            enemy.x,
            enemy.y,
            damage
        );

        const isDead =
            enemy.takeDamage(damage);

        if (!isDead) {
            this.scene.soundManager
                ?.sfx("hit", 0.25);

            this.flashTarget(enemy);
            return;
        }

        const explosionX = enemy.x;
        const explosionY = enemy.y;

        const isElite =
            enemy.stats?.elite === true;

        const enemyScore =
            enemy.stats?.score || 10;

        const enemyType =
            enemy.type ||
            enemy.stats?.type ||
            "scout";

        enemy.destroy();

        this.scene.waveManager.enemyKilled();
        this.scene.addScore(enemyScore);

        this.scene.saveManager
            ?.addEnemyKill({
                elite: isElite
            });

        this.scene.xpManager?.addEnemyXP(
            enemyType,
            isElite
        );

        const creditsReward = isElite
            ? 150
            : Math.max(10, enemyScore * 2);

        this.scene.creditsManager?.add(
            creditsReward,
            "ENEMY DESTROYED"
        );

        this.scene.effects.showDamage(
            explosionX,
            explosionY,
            enemyScore
        );

        this.scene.soundManager?.sfx(
            "explosion",
            isElite ? 0.65 : 0.45
        );

        this.scene.effects
            .createExplosion(
                explosionX,
                explosionY
            );

        if (isElite) {
            this.scene.cameras.main.flash(
                180,
                255,
                200,
                0
            );

            this.scene.cameras.main.shake(
                260,
                0.01
            );

            for (let i = 0; i < 5; i++) {
                this.scene.time.delayedCall(
                    i * 70,
                    () => {
                        this.scene.effects
                            .createExplosion(
                                explosionX +
                                    Phaser.Math.Between(
                                        -45,
                                        45
                                    ),
                                explosionY +
                                    Phaser.Math.Between(
                                        -45,
                                        45
                                    )
                            );

                        this.scene.soundManager
                            ?.sfx(
                                "explosion",
                                0.35
                            );
                    }
                );
            }

            if (Math.random() < 0.5) {
                this.scene.powerUpManager
                    .spawnReward(
                        explosionX,
                        explosionY,
                        "shield"
                    );
            } else {
                this.scene.powerUpManager
                    .spawnReward(
                        explosionX,
                        explosionY,
                        "double"
                    );
            }
        } else {
            this.scene.powerUpManager
                .tryDropPowerUp(
                    explosionX,
                    explosionY
                );
        }

        this.scene.achievementManager?.check();
    }

    checkBulletHitsMine() {
        if (this.scene.isGameOver) return;
        if (!this.scene.mines) return;

        this.scene.bullets
            .getChildren()
            .forEach((bullet) => {
                if (!bullet?.active) return;

                this.scene.mines
                    .getChildren()
                    .forEach((mine) => {
                        if (
                            !mine?.active ||
                            !bullet?.active
                        ) return;

                        const distance =
                            Phaser.Math.Distance
                                .Between(
                                    bullet.x,
                                    bullet.y,
                                    mine.x,
                                    mine.y
                                );

                        if (distance < 36) {
                            const damage = Math.max(1, Math.round(
                                bullet.damage ?? (this.scene.upgradeManager?.getBulletDamage?.() ?? 1)
                            ));
                            bullet.destroy();

                            const isDead = mine.takeDamage(damage);

                            if (!isDead) {
                                this.scene
                                    .soundManager
                                    ?.sfx(
                                        "hit",
                                        0.25
                                    );

                                this.flashTarget(
                                    mine
                                );

                                return;
                            }

                            this.explodeMine(
                                mine,
                                true
                            );
                        }
                    });
            });
    }

    checkMineHitsPlayer() {
        if (
            this.scene.isGameOver ||
            this.scene.playerInvincible
        ) return;

        if (
            !this.scene.player?.active ||
            !this.scene.mines
        ) return;

        this.scene.mines
            .getChildren()
            .forEach((mine) => {
                if (
                    !mine?.active ||
                    !mine.isArmed?.()
                ) return;

                const distance =
                    Phaser.Math.Distance.Between(
                        mine.x,
                        mine.y,
                        this.scene.player.x,
                        this.scene.player.y
                    );

                if (
                    distance <
                    mine.triggerRadius
                ) {
                    this.explodeMine(
                        mine,
                        false
                    );

                    if (
                        this.scene
                            .powerUpManager
                            ?.hasShield?.()
                    ) {
                        this.scene
                            .powerUpManager
                            .breakShield();

                        return;
                    }

                    this.scene.soundManager
                        ?.sfx("hit", 0.55);

                    this.scene.damagePlayer();
                }
            });
    }

    explodeMine(
        mine,
        giveScore = true
    ) {
        if (!mine?.active) return;

        const x = mine.x;
        const y = mine.y;
        const score =
            mine.scoreValue || 60;

        mine.destroy();

        this.scene.soundManager?.sfx(
            "explosion",
            0.5
        );

        this.scene.effects
            .createExplosion(x, y);

        this.createMineShockwave(x, y);

        this.scene.cameras.main.shake(
            90,
            0.006
        );

        this.scene.cameras.main.flash(
            120,
            255,
            120,
            40
        );

        if (giveScore) {
            this.scene.addScore(score);

            this.scene.effects.showDamage(
                x,
                y,
                score
            );
        }
    }

    createMineShockwave(x, y) {
        const ring =
            this.scene.add.circle(
                x,
                y,
                18,
                0xff7a18,
                0.18
            )
                .setStrokeStyle(
                    4,
                    0xfb923c,
                    1
                )
                .setDepth(40);

        this.scene.tweens.add({
            targets: ring,
            radius: 95,
            alpha: 0,
            duration: 360,
            ease: "Quad.easeOut",
            onComplete: () =>
                ring.destroy()
        });

        for (let i = 0; i < 10; i++) {
            const spark =
                this.scene.add.circle(
                    x,
                    y,
                    Phaser.Math.Between(
                        3,
                        6
                    ),
                    0xffa726,
                    Phaser.Math.FloatBetween(
                        0.5,
                        1
                    )
                ).setDepth(41);

            this.scene.tweens.add({
                targets: spark,
                x:
                    x +
                    Phaser.Math.Between(
                        -95,
                        95
                    ),
                y:
                    y +
                    Phaser.Math.Between(
                        -95,
                        95
                    ),
                alpha: 0,
                scale: 0,
                duration:
                    Phaser.Math.Between(
                        260,
                        520
                    ),
                ease: "Quad.easeOut",
                onComplete: () =>
                    spark.destroy()
            });
        }
    }

    checkBulletHitsAsteroid() {
        if (this.scene.isGameOver) return;
        if (!this.scene.asteroids) return;

        this.scene.bullets
            .getChildren()
            .forEach((bullet) => {
                if (!bullet?.active) return;

                this.scene.asteroids
                    .getChildren()
                    .forEach((asteroid) => {
                        if (
                            !asteroid?.active ||
                            !bullet?.active
                        ) return;

                        const distance =
                            Phaser.Math.Distance
                                .Between(
                                    bullet.x,
                                    bullet.y,
                                    asteroid.x,
                                    asteroid.y
                                );

                        const hitRadius =
                            asteroid
                                .damageRadius ||
                            48;

                        if (distance < hitRadius) {
                            const damage = Math.max(1, Math.round(
                                bullet.damage ?? (this.scene.upgradeManager?.getBulletDamage?.() ?? 1)
                            ));
                            bullet.destroy();

                            this.scene.effects.hitFreeze(18);
                            this.scene.effects.showDamage(asteroid.x, asteroid.y, damage);

                            const isDead = asteroid.takeDamage(damage);

                            if (!isDead) {
                                this.scene
                                    .soundManager
                                    ?.sfx(
                                        "hit",
                                        0.25
                                    );

                                this.flashTarget(
                                    asteroid
                                );

                                this.scene
                                    .cameras.main
                                    .shake(
                                        25,
                                        0.0015
                                    );

                                return;
                            }

                            this.destroyAsteroid(
                                asteroid,
                                true
                            );
                        }
                    });
            });
    }

    checkAsteroidHitsPlayer() {
        if (
            this.scene.isGameOver ||
            this.scene.playerInvincible
        ) return;

        if (
            !this.scene.player?.active ||
            !this.scene.asteroids
        ) return;

        this.scene.asteroids
            .getChildren()
            .forEach((asteroid) => {
                if (
                    !asteroid?.active ||
                    !this.scene.player?.active
                ) return;

                const distance =
                    Phaser.Math.Distance.Between(
                        asteroid.x,
                        asteroid.y,
                        this.scene.player.x,
                        this.scene.player.y
                    );

                const hitRadius =
                    asteroid.damageRadius || 48;

                if (
                    distance <
                    hitRadius + 22
                ) {
                    this.destroyAsteroid(
                        asteroid,
                        false
                    );

                    if (
                        this.scene
                            .powerUpManager
                            ?.hasShield?.()
                    ) {
                        this.scene
                            .powerUpManager
                            .breakShield();

                        return;
                    }

                    this.scene.soundManager
                        ?.sfx("hit", 0.55);

                    this.scene.damagePlayer();
                }
            });
    }

    destroyAsteroid(
        asteroid,
        giveScore = true
    ) {
        if (!asteroid?.active) return;

        const x = asteroid.x;
        const y = asteroid.y;

        const score =
            asteroid.scoreValue || 75;

        asteroid.destroy();

        this.scene.soundManager?.sfx(
            "explosion",
            0.4
        );

        this.scene.effects
            .createExplosion(x, y);

        this.createAsteroidDebris(x, y);

        if (giveScore) {
            this.scene.addScore(score);

            this.scene.effects.showDamage(
                x,
                y,
                score
            );
        }

        this.scene.cameras.main.shake(
            45,
            0.002
        );
    }

    createAsteroidDebris(x, y) {
        for (let i = 0; i < 7; i++) {
            const rock =
                this.scene.add.circle(
                    x,
                    y,
                    Phaser.Math.Between(
                        3,
                        7
                    ),
                    0xf97316,
                    Phaser.Math.FloatBetween(
                        0.45,
                        0.9
                    )
                ).setDepth(32);

            this.scene.tweens.add({
                targets: rock,
                x:
                    x +
                    Phaser.Math.Between(
                        -70,
                        70
                    ),
                y:
                    y +
                    Phaser.Math.Between(
                        -70,
                        70
                    ),
                alpha: 0,
                scale: 0,
                duration:
                    Phaser.Math.Between(
                        260,
                        520
                    ),
                ease: "Quad.easeOut",
                onComplete: () =>
                    rock.destroy()
            });
        }
    }

    flashTarget(target) {
        target.setTintFill(0xffffff);

        this.scene.tweens.add({
            targets: target,
            alpha: 0.65,
            duration: 45,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (target.active) {
                    target.clearTint();
                    target.setAlpha(1);
                }
            }
        });
    }

    checkEnemyBulletHitsPlayer() {
        if (
            this.scene.isGameOver ||
            this.scene.playerInvincible
        ) return;

        if (!this.scene.player?.active) return;

        this.scene.enemyBullets
            .getChildren()
            .forEach((bullet) => {
                if (!bullet.active) return;

                const distance =
                    Phaser.Math.Distance.Between(
                        bullet.x,
                        bullet.y,
                        this.scene.player.x,
                        this.scene.player.y
                    );

                if (distance < 42) {
                    bullet.destroy();

                    if (
                        this.scene
                            .powerUpManager
                            ?.hasShield?.()
                    ) {
                        this.scene
                            .powerUpManager
                            .breakShield();

                        return;
                    }

                    this.scene.soundManager
                        ?.sfx("hit", 0.55);

                    this.scene.damagePlayer();
                }
            });
    }

    checkEnemyHitsPlayer() {
        if (
            this.scene.isGameOver ||
            this.scene.playerInvincible
        ) return;

        if (!this.scene.player?.active) return;

        this.scene.enemies
            .getChildren()
            .forEach((enemy) => {
                if (
                    !enemy.active ||
                    !this.scene.player?.active
                ) return;

                const distance =
                    Phaser.Math.Distance.Between(
                        enemy.x,
                        enemy.y,
                        this.scene.player.x,
                        this.scene.player.y
                    );

                if (distance < 55) {
                    const explosionX =
                        enemy.x;

                    const explosionY =
                        enemy.y;

                    enemy.destroy();
                    this.scene.waveManager?.enemyKilled?.();

                    this.scene.soundManager
                        ?.sfx(
                            "explosion",
                            0.55
                        );

                    this.scene.effects
                        .createExplosion(
                            explosionX,
                            explosionY
                        );

                    if (
                        this.scene
                            .powerUpManager
                            ?.hasShield?.()
                    ) {
                        this.scene
                            .powerUpManager
                            .breakShield();

                        return;
                    }

                    this.scene.soundManager
                        ?.sfx("hit", 0.55);

                    this.scene.damagePlayer();
                }
            });
    }
}