export default class CheckpointManager {

    constructor(scene) {

        this.scene = scene;

        this.lastCheckpointStage =
            scene.registry.get("checkpointStage") || 1;

        this.lastCheckpointWave =
            scene.registry.get("checkpointWave") || 1;

        this.lastCheckpointScore =
            scene.registry.get("checkpointScore") || 0;
    }

    saveWaveCheckpoint(stage, wave, score) {

        this.lastCheckpointStage = stage;
        this.lastCheckpointWave = wave;
        this.lastCheckpointScore = score;

        this.scene.registry.set("checkpointStage", stage);
        this.scene.registry.set("checkpointWave", wave);
        this.scene.registry.set("checkpointScore", score);
    }

    restartFromCheckpoint() {
        this.scene.scene.restart();
    }

    getStartStage() {
        return this.lastCheckpointStage;
    }

    getStartWave() {
        return this.lastCheckpointWave;
    }

    getStartScore() {
        return this.lastCheckpointScore;
    }

}