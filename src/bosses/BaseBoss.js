import Phaser from "phaser";

export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, config.texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;

        this.maxHp = config.hp;
        this.hp = config.hp;

        this.score = config.score;
        this.entryY = config.entryY;
        this.fireDelay = config.fireDelay;

        this.isDead = false;
        this.phase = 1;
        this.lastShot = 0;

        this.setDepth(20);
        this.setScale(config.scale);
    }

    enterBattlefield() {
        this.scene.tweens.add({
            targets: this,
            y: this.entryY,
            duration: 2200,
            ease: "Sine.easeOut"
        });
    }

    takeDamage(amount = 1) {
        if (this.isDead) return false;

        this.hp -= amount;

        this.updatePhase();

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            return true;
        }

        return false;
    }

    updatePhase() {
        const percent = this.hp / this.maxHp;

        if (percent <= 0.33 && this.phase < 3) {
            this.phase = 3;
            this.onPhaseChanged(3);
        }
        else if (percent <= 0.66 && this.phase < 2) {
            this.phase = 2;
            this.onPhaseChanged(2);
        }
    }

    onPhaseChanged() {
        // Override
    }

    shoot() {
        // Override
    }

    updateMovement() {
        // Override
    }

    update() {
        if (this.isDead) return;

        this.updateMovement();

        if (this.scene.time.now - this.lastShot >= this.fireDelay) {
            this.lastShot = this.scene.time.now;
            this.shoot();
        }
    }
}