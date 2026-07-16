import Phaser from "phaser";

const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth <= 900;

const config = {
    type: Phaser.AUTO,
    parent: "game",

    width: 1280,
    height: 720,

    backgroundColor: "#020617",

    scale: {
        mode: isMobile
            ? Phaser.Scale.ENVELOP
            : Phaser.Scale.FIT,

        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
        expandParent: false,
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

    banner: false,

    callbacks: {
        postBoot: (game) => {
            const resize = () => {
                game.scale.refresh();
            };

            window.addEventListener("resize", resize);

            window.addEventListener("orientationchange", () => {
                window.setTimeout(resize, 180);
            });
        }
    }
};

export default config;