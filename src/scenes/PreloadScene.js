import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        const image = (key, path) => this.load.image(key, `/assets/${path}`);
        const audio = (key, path) => this.load.audio(key, `/assets/audio/${path}`);

        image("background_space", "backgrounds/background_space_v01.png");
        image("background_stage2", "backgrounds/background_stage2.png");
        image("background_stage3", "backgrounds/background_stage3.png");
        image("background_quantum_rift", "backgrounds/background_quantum_rift.png");
        image("background_frozen_void", "backgrounds/background_frozen_void.png");

        image("player", "player/player_ship_mk1.png");
        image("ship_phantom", "player/ship_phantom.png");
        image("ship_eclipse", "player/ship_eclipse.png");
        image("ship_titan", "player/ship_titan.png");
        image("ship_spectre", "player/ship_spectre.png");
        image("ship_guardian", "player/ship_guardian.png");
        image("ship_nova", "player/ship_nova.png");

        image("enemy_scout", "enemies/enemy_scout.png");
        image("enemy_fighter", "enemies/enemy_fighter.png");
        image("enemy_bomber", "enemies/enemy_bomber.png");
        image("enemy_interceptor", "enemies/enemy_interceptor.png");
        image("enemy_minelayer", "enemies/enemy_minelayer.png");
        image("enemy_elite", "enemies/enemy_elite.png");

        image("boss_alpha", "bosses/boss_alpha.png");
        image("boss_omega", "bosses/boss_omega.png");
        image("boss_leviathan", "bosses/boss_leviathan.png");

        image("player_laser", "effects/player_laser.png");
        image("enemy_plasma", "effects/enemy_plasma.png");
        image("power_double", "effects/power_double.png");
        image("power_shield", "effects/power_shield.png");
        image("asteroid", "effects/asteroid.png");
        image("space_mine", "effects/space_mine.png");

        audio("menu_music", "menu_music.mp3");
        audio("game_music", "game_music.mp3");
        audio("boss_music", "boss_music.mp3");
        audio("laser", "laser.wav");
        audio("enemy_laser", "enemy_laser.wav");
        audio("explosion", "explosion.wav");
        audio("powerup", "powerup.wav");
        audio("hit", "hit.wav");
        audio("warning", "warning.wav");
        audio("button", "button.wav");
    }

    create() {
        this.scene.start("SplashScene");
    }
}
