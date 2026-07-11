import Phaser from "phaser";

const config = {
    type: Phaser.AUTO,
    parent: "game",

    // دقة اللعبة الأساسية
    width: 1280,
    height: 720,

    backgroundColor: "#020617",

    scale: {
        // يحافظ على أبعاد اللعبة بدون تشويه
        mode: Phaser.Scale.FIT,

        // يوسّط اللعبة أفقياً وعمودياً
        autoCenter: Phaser.Scale.CENTER_BOTH,

        // يمنع ظهور أجزاء من الـ Canvas خارج الشاشة
        autoRound: true,

        // يجعل الحاوية تستفيد من كامل مساحة الشاشة
        expandParent: true,

        // العنصر المستخدم عند تفعيل Fullscreen لاحقاً
        fullscreenTarget: "game"
    },

    input: {
        activePointers: 2,

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