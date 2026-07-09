import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image("background_space", "/assets/backgrounds/background_space_v01.png");
        this.load.image("background_stage2","/assets/backgrounds/background_stage2.png");

        this.load.image("player", "/assets/player/player_ship_mk1.png");
        this.load.image("enemy_scout", "/assets/enemies/enemy_scout.png");
        this.load.image(
        "player_laser",
        "/assets/effects/player_laser.png"
        );
        this.load.image("enemy_fighter", "/assets/enemies/enemy_fighter.png");
        this.load.image("enemy_plasma", "/assets/effects/enemy_plasma.png");
        this.load.image("power_double", "/assets/effects/power_double.png");
        this.load.image("power_shield","assets/effects/power_shield.png");
        this.load.image("enemy_bomber", "/assets/enemies/enemy_bomber.png");
        this.load.image("boss_alpha", "/assets/bosses/boss_alpha.png");
        this.load.image("asteroid", "/assets/effects/asteroid.png");
        this.load.image("background_stage2","/assets/backgrounds/background_stage2.png");
        this.load.image("enemy_interceptor",    "/assets/enemies/enemy_interceptor.png");
        this.load.image("enemy_minelayer", "/assets/enemies/enemy_minelayer.png");
        this.load.image("space_mine", "/assets/effects/space_mine.png");
        this.load.image("boss_omega", "/assets/bosses/boss_omega.png");
        this.load.image("background_stage3", "/assets/backgrounds/background_stage3.png");
        this.load.image("enemy_elite", "/assets/enemies/enemy_elite.png");
        this.load.image("boss_leviathan", "assets/bosses/boss_leviathan.png");
        this.load.audio("menu_music", "assets/audio/menu_music.mp3");
        this.load.audio("menu_music", "/assets/audio/menu_music.mp3");
        this.load.audio("game_music", "/assets/audio/game_music.mp3");
        this.load.audio("boss_music", "/assets/audio/boss_music.mp3");

        this.load.audio("laser", "/assets/audio/laser.wav");
        this.load.audio("enemy_laser", "/assets/audio/enemy_laser.wav");
        this.load.audio("explosion", "/assets/audio/explosion.wav");
        this.load.audio("powerup", "/assets/audio/powerup.wav");
        this.load.audio("hit", "/assets/audio/hit.wav");
        this.load.audio("warning", "/assets/audio/warning.wav");
        this.load.audio("button", "/assets/audio/button.wav");
    }

    create() {
        this.scene.start("SplashScene");
        const g = this.add.graphics();

g.fillStyle(0x22ff66, 1);
g.fillCircle(16, 16, 6);

g.lineStyle(3, 0x7cff9b, 0.9);
g.strokeCircle(16, 16, 11);

g.lineStyle(2, 0x22ff66, 0.55);
g.strokeCircle(16, 16, 15);

g.generateTexture("leviathan_pulse", 32, 32);
g.destroy();
    }
}