import Phaser from "phaser";

export default class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.lastExplosionSfxTime = 0;
    }

    createExplosion(x, y, options = {}) {
        const {
            radius = 18,
            color = 0x38bdf8,
            shake = true,
            sound = true
        } = options;

        if (shake) {
            this.scene.cameras.main.shake(80, 0.004);
        }

        if (sound) {
            this.playExplosionSfx();
        }

        const explosion = this.scene.add.circle(
            x,
            y,
            radius,
            color,
            0.9
        );

        explosion.setDepth(15);

        const ring = this.scene.add.circle(
            x,
            y,
            radius + 8,
            color,
            0
        );

        ring.setDepth(14);
        ring.setStrokeStyle(3, color, 0.75);

        this.scene.tweens.add({
            targets: explosion,
            scale: 2.4,
            alpha: 0,
            duration: 220,
            ease: "Quad.easeOut",
            onComplete: () => explosion.destroy()
        });

        this.scene.tweens.add({
            targets: ring,
            scale: 2.8,
            alpha: 0,
            duration: 320,
            ease: "Quad.easeOut",
            onComplete: () => ring.destroy()
        });
    }

    playExplosionSfx() {
        if (!this.scene.soundManager?.sfx) return;

        if (this.scene.time.now <= this.lastExplosionSfxTime + 90) return;

        this.scene.soundManager.sfx("explosion", 0.42);
        this.lastExplosionSfxTime = this.scene.time.now;
    }

    showDamage(x, y, damage) {
        this.scene.soundManager?.sfx?.("hit", 0.22);

        const txt = this.scene.add.text(
            x,
            y - 25,
            "+" + damage,
            {
                fontSize: "22px",
                fontStyle: "bold",
                color: "#7DF9FF",
                stroke: "#000",
                strokeThickness: 4
            }
        );

        txt.setOrigin(0.5);
        txt.setDepth(50);

        this.scene.tweens.add({
            targets: txt,
            y: y - 70,
            alpha: 0,
            scale: 1.3,
            duration: 450,
            ease: "Cubic.easeOut",
            onComplete: () => txt.destroy()
        });
    }

    hitFreeze(duration = 45) {
        this.scene.physics.world.timeScale = 0.15;

        this.scene.time.delayedCall(duration, () => {
            this.scene.physics.world.timeScale = 1;
        });
    }
}