import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        /*
         * نستخدم مسارًا نسبيًا بدون / في البداية
         * حتى تعمل الملفات محليًا وعلى Vercel بنفس الطريقة.
         */
        const image = (key, path) => {
            this.load.image(key, `assets/${path}`);
        };

        const audio = (key, path) => {
            this.load.audio(key, `assets/audio/${path}`);
        };

        /*
         * مراقبة أخطاء تحميل الملفات.
         * افتح Console إذا لم تظهر أي صورة، وسيظهر اسم الملف المفقود.
         */
        this.load.on("loaderror", (file) => {
            console.error(
                `[PRELOAD ERROR] Failed to load: ${file.key}`,
                file.src
            );
        });

        // =========================================================
        // BACKGROUNDS
        // =========================================================

        image(
            "background_space",
            "backgrounds/background_space_v01.png"
        );

        image(
            "background_stage2",
            "backgrounds/background_stage2.png"
        );

        image(
            "background_stage3",
            "backgrounds/background_stage3.png"
        );

        image(
            "background_quantum_rift",
            "backgrounds/background_quantum_rift.png"
        );

        image(
            "background_frozen_void",
            "backgrounds/background_frozen_void.png"
        );

        // =========================================================
        // MAIN MENU BRAND
        // =========================================================

        image(
            "jude_space_logo",
            "ui/jude_space_shooter_logo.png"
        );

        // =========================================================
        // MAIN MENU HANGAR
        // =========================================================

        image("hangar_floor", "hangar/hangar_floor.png");
        image("hangar_shadow", "hangar/hangar_shadow.png");
        image("hangar_beam", "hangar/hangar_beam.png");
        image("energy_core", "hangar/energy_core.png");
        image("robot_arm_left", "hangar/robot_arm_left.png");
        image("robot_arm_right", "hangar/robot_arm_right.png");
        image("console_left", "hangar/console_left.png");
        image("console_right", "hangar/console_right.png");

        // =========================================================
        // PLAYER SHIPS
        // =========================================================

        image(
            "player",
            "player/player_ship_mk1.png"
        );

        image(
            "ship_phantom",
            "player/ship_phantom.png"
        );

        image(
            "ship_eclipse",
            "player/ship_eclipse.png"
        );

        image(
            "ship_titan",
            "player/ship_titan.png"
        );

        image(
            "ship_spectre",
            "player/ship_spectre.png"
        );

        image(
            "ship_guardian",
            "player/ship_guardian.png"
        );

        image(
            "ship_nova",
            "player/ship_nova.png"
        );

        // =========================================================
        // ENEMIES
        // =========================================================

        image(
            "enemy_scout",
            "enemies/enemy_scout.png"
        );

        image(
            "enemy_fighter",
            "enemies/enemy_fighter.png"
        );

        image(
            "enemy_bomber",
            "enemies/enemy_bomber.png"
        );

        image(
            "enemy_interceptor",
            "enemies/enemy_interceptor.png"
        );

        image(
            "enemy_minelayer",
            "enemies/enemy_minelayer.png"
        );

        image(
            "enemy_elite",
            "enemies/enemy_elite.png"
        );

        // =========================================================
        // BOSSES
        // =========================================================

        image(
            "boss_alpha",
            "bosses/boss_alpha.png"
        );

        image(
            "boss_omega",
            "bosses/boss_omega.png"
        );

        image(
            "boss_leviathan",
            "bosses/boss_leviathan.png"
        );

        // =========================================================
        // EFFECTS
        // =========================================================

        image(
            "player_laser",
            "effects/player_laser.png"
        );

        image(
            "enemy_plasma",
            "effects/enemy_plasma.png"
        );

        image(
            "power_double",
            "effects/power_double.png"
        );

        image(
            "power_shield",
            "effects/power_shield.png"
        );

        image(
            "asteroid",
            "effects/asteroid.png"
        );

        image(
            "space_mine",
            "effects/space_mine.png"
        );

        // =========================================================
        // MUSIC
        // =========================================================

        audio(
            "menu_music",
            "menu_music.mp3"
        );

        audio(
            "game_music",
            "game_music.mp3"
        );

        audio(
            "boss_music",
            "boss_music.mp3"
        );

        // =========================================================
        // SOUND EFFECTS
        // =========================================================

        audio(
            "laser",
            "laser.wav"
        );

        audio(
            "enemy_laser",
            "enemy_laser.wav"
        );

        audio(
            "explosion",
            "explosion.wav"
        );

        audio(
            "powerup",
            "powerup.wav"
        );

        audio(
            "hit",
            "hit.wav"
        );

        audio(
            "warning",
            "warning.wav"
        );

        audio(
            "button",
            "button.wav"
        );
    }

    create() {
        this.scene.start("SplashScene");
    }
}