import Phaser from "phaser";

export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.storageKey = "jude_space_shooter_audio";

        const saved = this.loadSettings();

        this.musicVolume = saved.musicVolume ?? 0.25;
        this.sfxVolume = saved.sfxVolume ?? 0.5;
        this.muted = saved.muted ?? false;
        this.enabled = true;

        this.currentMusic = this.getGlobalMusic();
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

    getGlobalMusic() {
        const soundManager = this.scene.sound;
        return soundManager.__judeActiveMusic || null;
    }

    setGlobalMusic(sound) {
        this.scene.sound.__judeActiveMusic = sound || null;
        this.currentMusic = sound || null;
    }

    getMusicSounds() {
        const sounds = this.scene.sound.sounds || [];
        return sounds.filter((sound) => sound?.__judeMusic === true);
    }

    stopDuplicateMusic(except = null) {
        this.getMusicSounds().forEach((sound) => {
            if (sound === except) return;

            try {
                sound.stop();
                sound.destroy();
            } catch (error) {
                console.warn("Could not stop duplicate music:", error);
            }
        });
    }

    playMusic(key, volume = null) {
        if (!this.enabled) return null;
        if (!this.scene.cache.audio.exists(key)) return null;

        const targetVolume =
            volume !== null
                ? Phaser.Math.Clamp(volume, 0, 1)
                : this.musicVolume;

        let activeMusic = this.getGlobalMusic();

        if (
            activeMusic?.key === key &&
            activeMusic.isPlaying
        ) {
            activeMusic.__judeTargetVolume = targetVolume;
            activeMusic.setVolume(this.muted ? 0 : targetVolume);
            this.stopDuplicateMusic(activeMusic);
            this.setGlobalMusic(activeMusic);
            return activeMusic;
        }

        this.stopMusic();

        const music = this.scene.sound.add(key, {
            loop: true,
            volume: this.muted ? 0 : targetVolume
        });

        music.__judeMusic = true;
        music.__judeTargetVolume = targetVolume;

        music.once("destroy", () => {
            if (this.getGlobalMusic() === music) {
                this.setGlobalMusic(null);
            }
        });

        music.play();
        this.setGlobalMusic(music);
        this.stopDuplicateMusic(music);

        return music;
    }

    stopMusic() {
        const activeMusic = this.getGlobalMusic();

        if (activeMusic) {
            try {
                activeMusic.stop();
                activeMusic.destroy();
            } catch (error) {
                console.warn("Could not stop active music:", error);
            }
        }

        this.stopDuplicateMusic();
        this.setGlobalMusic(null);
    }

    stopMusicByKey(key) {
        if (!key) return;

        this.getMusicSounds().forEach((sound) => {
            if (sound.key !== key) return;

            try {
                sound.stop();
                sound.destroy();
            } catch (error) {
                console.warn(`Could not stop music ${key}:`, error);
            }
        });

        if (this.getGlobalMusic()?.key === key) {
            this.setGlobalMusic(null);
        }
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

        const activeMusic = this.getGlobalMusic();

        if (activeMusic) {
            activeMusic.__judeTargetVolume = this.musicVolume;
            activeMusic.setVolume(this.muted ? 0 : this.musicVolume);
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

        const activeMusic = this.getGlobalMusic();

        if (activeMusic) {
            const volume =
                activeMusic.__judeTargetVolume ?? this.musicVolume;

            activeMusic.setVolume(this.muted ? 0 : volume);
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
