import Bullet from "../entities/Bullet";
import EnemyBullet from "../entities/EnemyBullet";

export default class ShootingManager {
    constructor(scene) {
        this.scene = scene;
        this.lastShotTime = 0;
        this.isFiring = false;
        this.lastLaserSfxTime = 0;

        this.scene.input.on("pointerdown", () => {
            this.isFiring = true;
        });

        this.scene.input.on("pointerup", () => {
            this.isFiring = false;
        });
    }

    update() {
        this.handlePlayerShooting();

        this.scene.bullets.getChildren().forEach((bullet) => bullet.update());
        this.scene.enemyBullets.getChildren().forEach((bullet) => bullet.update());
    }

    handlePlayerShooting() {
        if (!this.isFiring) return;

        const fireDelay = this.scene.upgradeManager?.getFireRate?.() ?? 180;

        if (this.scene.time.now <= this.lastShotTime + fireDelay) return;

        const doubleLaser = this.scene.powerUpManager.getWeaponMode() === "double";
        const tripleShot = this.scene.upgradeManager?.hasTripleShot?.() ?? false;

        if (!doubleLaser && !tripleShot) {
            this.scene.bullets.add(
                new Bullet(this.scene, this.scene.player.x, this.scene.player.y - 45)
            );
        } else if (doubleLaser && !tripleShot) {
            this.scene.bullets.add(
                new Bullet(this.scene, this.scene.player.x - 18, this.scene.player.y - 45)
            );
            this.scene.bullets.add(
                new Bullet(this.scene, this.scene.player.x + 18, this.scene.player.y - 45)
            );
        } else if (!doubleLaser && tripleShot) {
            [-20, 0, 20].forEach((offset) => {
                this.scene.bullets.add(
                    new Bullet(this.scene, this.scene.player.x + offset, this.scene.player.y - 45)
                );
            });
        } else {
            [-20, 0, 20].forEach((offset) => {
                this.scene.bullets.add(
                    new Bullet(this.scene, this.scene.player.x - 18 + offset, this.scene.player.y - 45)
                );
                this.scene.bullets.add(
                    new Bullet(this.scene, this.scene.player.x + 18 + offset, this.scene.player.y - 45)
                );
            });
        }

        this.playPlayerLaserSfx();
        this.lastShotTime = this.scene.time.now;
    }

    playPlayerLaserSfx() {
        if (!this.scene.soundManager?.sfx) return;

        if (this.scene.time.now <= this.lastLaserSfxTime + 90) return;

        this.scene.soundManager.sfx("laser", 0.22);
        this.lastLaserSfxTime = this.scene.time.now;
    }

    handleEnemyShooting(enemy) {
        if (!this.scene.player?.active) return;

        if (enemy.type === "fighter") {
            this.handleFighterShooting(enemy);
        }

        if (enemy.type === "elite") {
            this.handleEliteShooting(enemy);
        }
    }

    handleFighterShooting(enemy) {
        if (this.scene.time.now <= (enemy.lastShotTime || 0) + 1600) return;

        const plasma = new EnemyBullet(
            this.scene,
            enemy.x,
            enemy.y + 40,
            this.scene.player.x,
            this.scene.player.y
        );

        this.scene.enemyBullets.add(plasma);
        this.scene.soundManager?.sfx?.("enemy_laser", 0.2);

        enemy.lastShotTime = this.scene.time.now;
    }

    handleEliteShooting(enemy) {
        if (this.scene.time.now <= (enemy.lastShotTime || 0) + 950) return;
        if (!enemy.canShoot) return;

        this.fireEliteSpread(enemy);

        if (this.scene.time.now >= (enemy.lastHeavyShotTime || 0) + 2600) {
            this.fireEliteAimedShot(enemy);
            enemy.lastHeavyShotTime = this.scene.time.now;
        }

        this.scene.soundManager?.sfx?.("enemy_laser", 0.26);
        enemy.lastShotTime = this.scene.time.now;
    }

    fireEliteSpread(enemy) {
        const spacing = 78;
        const count = 3;
        const start = -Math.floor(count / 2);

        for (let i = 0; i < count; i++) {
            const offset = (start + i) * spacing;

            const bullet = new EnemyBullet(
                this.scene,
                enemy.x + offset,
                enemy.y + 55,
                enemy.x + offset,
                this.scene.scale.height + 200
            );

            bullet.setScale(0.075);
            this.scene.enemyBullets.add(bullet);
        }
    }

    fireEliteAimedShot(enemy) {
        const bullet = new EnemyBullet(
            this.scene,
            enemy.x,
            enemy.y + 70,
            this.scene.player.x,
            this.scene.player.y
        );

        bullet.setScale(0.11);
        this.scene.enemyBullets.add(bullet);
    }
}