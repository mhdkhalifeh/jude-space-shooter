import Mine from "../entities/Mine";

export default class MineManager {
    constructor(scene) {
        this.scene = scene;
    }

    update() {
        if (!this.scene.mines) return;

        this.scene.mines.getChildren().forEach((mine) => {
            if (mine.active) mine.update();
        });
    }

    spawnMine(x, y) {
        if (!this.scene.mines) return;

        const mine = new Mine(this.scene, x, y);
        this.scene.mines.add(mine);
    }
}