import Phaser from "phaser";

const VISUALS = {
    double: { texture: "power_double", tint: 0x38bdf8 },
    shield: { texture: "power_shield", tint: 0x22c55e },
    spread: { texture: "power_double", tint: 0xa78bfa },
    railgun: { texture: "power_double", tint: 0xf97316 },
    homing: { texture: "power_double", tint: 0xfacc15 },
    overdrive: { texture: "power_double", tint: 0xef4444 },
    damage: { texture: "power_double", tint: 0xfb7185 },
    emp: { texture: "power_shield", tint: 0x22d3ee },
    repair: { texture: "power_shield", tint: 0x4ade80 }
};

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = "double") {
        const visual = VISUALS[type] || VISUALS.double;
        super(scene, x, y, visual.texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.speed = 105;
        this.setScale(0.09);
        this.setDepth(9);
        this.setTint(visual.tint);

        scene.tweens.add({ targets: this, scaleX: 0.105, scaleY: 0.105, duration: 620, yoyo: true, repeat: -1 });
    }

    update() {
        const delta = this.scene.game.loop.delta / 1000;
        this.y += this.speed * delta;
        this.angle += 1.4;
        if (this.y > this.scene.scale.height + 80) this.destroy();
    }
}
