import Phaser from "phaser";

const config = {
    type: Phaser.AUTO,
    parent: "game",

    width: 1280,
    height: 720,

    backgroundColor: "#020617",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
        expandParent: true,

        /*
         * Phaser سيستخدم هذا العنصر عند طلب Fullscreen.
         * يجب أن يكون في index.html عنصر id="game".
         */
        fullscreenTarget: "game"
    },

    input: {
        activePointers: 3,

        mouse: {
            preventDefaultWheel: true
        },

        touch: {
            capture: true
        }
    },

    physics: {
        default: "arcade",

        arcade: {
            debug: false
        }
    },

    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
        transparent: false,
        powerPreference: "high-performance"
    },

    fps: {
        target: 60,
        forceSetTimeOut: false,
        smoothStep: true
    },

    audio: {
        disableWebAudio: false
    },

    banner: false
};

export default config;