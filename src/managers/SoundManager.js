export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.currentMusic = null;
        this.enabled = true;
    }

    playMusic(key, volume = 0.25) {
        if (!this.enabled) return;

        if (this.currentMusic?.key === key && this.currentMusic.isPlaying) return;

        if (this.currentMusic) {
            this.currentMusic.stop();
        }

        if (!this.scene.cache.audio.exists(key)) return;

        this.currentMusic = this.scene.sound.add(key, {
            loop: true,
            volume
        });

        this.currentMusic.play();
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    sfx(key, volume = 0.5) {
        if (!this.enabled) return;
        if (!this.scene.cache.audio.exists(key)) return;

        this.scene.sound.play(key, { volume });
    }
}