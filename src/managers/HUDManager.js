export default class HUDManager {
    constructor(scene) {
        this.scene = scene;
        this.scoreText = null;
        this.hpText = null;
        this.weaponText = null;
        this.weaponBarBg = null;
        this.weaponBar = null;
    }

    create() {
        const { width } = this.scene.scale;

        this.scoreText = this.scene.add.text(24, 22, "SCORE  000000", {
            fontSize: "24px",
            color: "#38BDF8",
            fontStyle: "bold",
            stroke: "#020617",
            strokeThickness: 4
        }).setDepth(100);

        this.hpText = this.scene.add.text(width - 170, 22, "❤ ❤ ❤", {
            fontSize: "28px",
            color: "#ff4444",
            stroke: "#020617",
            strokeThickness: 4
        }).setDepth(100);

        this.weaponText = this.scene.add.text(24, 58, "", {
            fontSize: "18px",
            color: "#7DF9FF",
            fontStyle: "bold",
            stroke: "#020617",
            strokeThickness: 3
        }).setDepth(100);

        this.weaponBarBg = this.scene.add.rectangle(24, 88, 180, 10, 0x0f172a, 0.9)
            .setOrigin(0, 0.5)
            .setDepth(100);

        this.weaponBar = this.scene.add.rectangle(24, 88, 180, 10, 0x38bdf8, 1)
            .setOrigin(0, 0.5)
            .setDepth(101);

        this.hideWeapon();
    }

    updateScore(score) {
        this.scoreText.setText(`SCORE  ${String(score).padStart(6, "0")}`);
    }

    updateHP(hp) {
        this.hpText.setText("❤ ".repeat(hp));
    }

    showWeapon(name) {
        this.weaponText.setText(name);
        this.weaponText.setVisible(true);
        this.weaponBarBg.setVisible(true);
        this.weaponBar.setVisible(true);
    }

    updateWeaponBar(percent) {
        const value = Math.max(0, Math.min(1, percent));
        this.weaponBar.width = 180 * value;
    }

    hideWeapon() {
        this.weaponText.setVisible(false);
        this.weaponBarBg.setVisible(false);
        this.weaponBar.setVisible(false);
    }
}