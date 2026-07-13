import Phaser from "phaser";
export default class SoundManager {
    constructor(scene) {
        this.scene = scene;

        this.storageKey = "jude_space_shooter_audio";

        const saved = this.loadSettings();

        this.musicVolume = saved.musicVolume ?? 0.25;
        this.sfxVolume = saved.sfxVolume ?? 0.5;
        this.muted = saved.muted ?? false;

        this.currentMusic = null;
        this.enabled = true;

        this.applyMuteState();
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn("Could not load audio settings:", error);
            return {};
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify({
                    musicVolume: this.musicVolume,
                    sfxVolume: this.sfxVolume,
                    muted: this.muted
                })
            );
        } catch (error) {
            console.warn("Could not save audio settings:", error);
        }
    }

    playMusic(key, volume = null) {
        if (!this.enabled) return;
        if (!this.scene.cache.audio.exists(key)) return;

        const targetVolume =
            volume !== null
                ? Phaser.Math.Clamp(volume, 0, 1)
                : this.musicVolume;

        if (
            this.currentMusic?.key === key &&
            this.currentMusic.isPlaying
        ) {
            this.currentMusic.setVolume(
                this.muted ? 0 : targetVolume
            );
            return;
        }

        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
        }

        this.currentMusic = this.scene.sound.add(key, {
            loop: true,
            volume: this.muted ? 0 : targetVolume
        });

        this.currentMusic.play();
    }

    stopMusic() {
        if (!this.currentMusic) return;

        this.currentMusic.stop();
        this.currentMusic.destroy();
        this.currentMusic = null;
    }

    sfx(key, volume = null) {
        if (!this.enabled || this.muted) return;
        if (!this.scene.cache.audio.exists(key)) return;

        const targetVolume =
            volume !== null
                ? Phaser.Math.Clamp(volume, 0, 1)
                : this.sfxVolume;

        this.scene.sound.play(key, {
            volume: targetVolume
        });
    }

    setMusicVolume(value) {
        this.musicVolume = Phaser.Math.Clamp(value, 0, 1);

        if (this.currentMusic) {
            this.currentMusic.setVolume(
                this.muted ? 0 : this.musicVolume
            );
        }

        this.saveSettings();
    }

    setSfxVolume(value) {
        this.sfxVolume = Phaser.Math.Clamp(value, 0, 1);
        this.saveSettings();
    }

    setMuted(value) {
        this.muted = Boolean(value);
        this.applyMuteState();
        this.saveSettings();
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    applyMuteState() {
        this.scene.sound.mute = this.muted;

        if (this.currentMusic) {
            this.currentMusic.setVolume(
                this.muted ? 0 : this.musicVolume
            );
        }
    }

    getMusicVolume() {
        return this.musicVolume;
    }

    getSfxVolume() {
        return this.sfxVolume;
    }

    isMuted() {
        return this.muted;
    }
}