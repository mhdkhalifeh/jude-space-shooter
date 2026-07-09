import Phaser from "phaser";

export default class BossLeviathan extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "boss_leviathan");

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.maxHp = 420;
        this.hp = this.maxHp;
        this.score = 15000;
        this.isDead = false;

        this.setScale(0.28);
        this.setDepth(40);

        this.body.setSize(this.width * 0.58, this.height * 0.62);
        this.body.setOffset(this.width * 0.21, this.height * 0.18);

        this.entryTargetY = 155;
        this.phase = 1;
        this.rageStarted = false;

        this.lastShot = 0;
        this.shotDelay = 1150;

        this.lastMineDrop = 0;
        this.mineDelay = 2600;

        this.weaponOffsets = [
            { x: -215, y: -45 },
            { x: 215, y: -45 },

            { x: -175, y: 40 },
            { x: 175, y: 40 },

            { x: -115, y: 125 },
            { x: 115, y: 125 },

            { x: 0, y: 75 }
        ];

        scene.tweens.add({
            targets: this,
            y: this.entryTargetY,
            duration: 1900,
            ease: "Sine.easeOut"
        });
    }

    update() {
        if (this.isDead) return;

        this.updatePhase();
        this.movePattern();
        this.attackPattern();
    }

    updatePhase() {
        const percent = this.hp / this.maxHp;

        if (percent <= 0.35) {
            this.phase = 3;
            this.shotDelay = 620;
            this.mineDelay = 1500;

            if (!this.rageStarted) {
                this.rageStarted = true;
                this.startRageMode();
            }
        } else if (percent <= 0.7) {
            this.phase = 2;
            this.shotDelay = 850;
            this.mineDelay = 2100;
        }
    }

    startRageMode() {
        this.scene.cameras.main.flash(400, 0, 255, 80);
        this.scene.cameras.main.shake(700, 0.012);

        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.05,
            scaleY: this.scaleY * 1.05,
            duration: 180,
            yoyo: true,
            repeat: 5
        });
    }

    movePattern() {
        const time = this.scene.time.now;

        const range = this.phase === 3 ? 285 : 220;
        const speed = this.phase === 3 ? 0.0021 : 0.0015;

        this.x = this.scene.scale.width / 2 + Math.sin(time * speed) * range;

        if (this.y < this.entryTargetY) return;

        this.y = this.entryTargetY + Math.sin(time * 0.0024) * 24;
    }

    attackPattern() {
        const now = this.scene.time.now;

        if (now - this.lastShot >= this.shotDelay) {
            this.lastShot = now;
            this.firePulsePattern();
        }

        if (now - this.lastMineDrop >= this.mineDelay) {
            this.lastMineDrop = now;
            this.dropMines();
        }
    }

    firePulsePattern() {
        if (this.phase === 1) {
            this.fireFromCore();
            return;
        }

        if (this.phase === 2) {
            this.fireFromSideCannons();
            this.fireFromCore();
            return;
        }

        this.fireFromAllCannons();
    }

    fireFromCore() {
        this.createPulseBullet(this.x, this.y + 90, 0, 285);
        this.createPulseBullet(this.x - 35, this.y + 85, -14, 275);
        this.createPulseBullet(this.x + 35, this.y + 85, 14, 275);
    }

    fireFromSideCannons() {
        const sideCannons = this.weaponOffsets.slice(0, 6);

        sideCannons.forEach((offset, index) => {
            const angle = index % 2 === 0 ? -18 : 18;

            this.createPulseBullet(
                this.x + offset.x,
                this.y + offset.y,
                angle,
                270
            );
        });
    }

    fireFromAllCannons() {
        this.weaponOffsets.forEach((offset, index) => {
            const spread = [-34, -22, -12, 0, 12, 22, 34];
            const angle = spread[index] || 0;

            this.createPulseBullet(
                this.x + offset.x,
                this.y + offset.y,
                angle,
                320
            );
        });
    }

    createPulseBullet(x, y, angle = 0, speed = 300) {
    const bullet = this.scene.enemyBullets.create(x, y, "leviathan_pulse");
    if (!bullet) return;

    bullet.setDepth(25);
    bullet.setAlpha(0.95);
    bullet.setScale(0.2);
    bullet.setTint(0x22ff66);

    bullet.body.enable = true;
    bullet.body.setAllowGravity(false);
    bullet.body.setSize(24, 24);
    bullet.body.setOffset(4, 4);

    const rad = Phaser.Math.DegToRad(90 + angle);

    this.scene.physics.velocityFromRotation(
        rad,
        speed,
        bullet.body.velocity
    );

    bullet.damage = 1;

    this.scene.tweens.add({
        targets: bullet,
        scaleX: 0.95,
        scaleY: 0.95,
        alpha: 0.75,
        duration: 350,
        ease: "Sine.easeOut"
    });

    this.scene.time.delayedCall(4500, () => {
        if (bullet.active) bullet.destroy();
    });
}
    dropMines() {
        if (!this.scene.mineManager?.spawnMine) return;

        this.scene.mineManager.spawnMine(this.x - 130, this.y + 95);
        this.scene.mineManager.spawnMine(this.x + 130, this.y + 95);

        if (this.phase >= 3) {
            this.scene.mineManager.spawnMine(this.x, this.y + 120);
        }
    }

   takeDamage(amount = 1) {
    if (this.isDead) return false;

    this.hp -= amount;

    this.setTint(0x66ff99);

    this.scene.time.delayedCall(70, () => {
        if (this.active) {
            this.clearTint();
            this.setAlpha(1);
        }
    });

    if (this.hp <= 0) {
        this.hp = 0;
        this.isDead = true;
        return true;
    }

    return false;
}
}