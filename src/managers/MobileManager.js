export default class MobileManager {
    constructor(scene) {
        this.scene = scene;
        this.isTouch = scene.sys.game.device.input.touch === true;
        this.isMobile = this.isTouch || window.innerWidth <= 900;
        this.isPortrait = window.innerHeight > window.innerWidth;
        this.quality = this.detectQuality();
        this.safe = this.getSafeArea();

        scene.registry.set("isMobile", this.isMobile);
        scene.registry.set("mobileQuality", this.quality);
        scene.registry.set("safeArea", this.safe);

        this.applyInputDefaults();
    }

    detectQuality() {
        if (!this.isMobile) return "high";

        const memory = Number(navigator.deviceMemory || 4);
        const cores = Number(navigator.hardwareConcurrency || 4);

        if (memory <= 2 || cores <= 4) return "low";
        if (memory <= 4 || cores <= 6) return "medium";
        return "high";
    }

    getSafeArea() {
        const portrait = window.innerHeight > window.innerWidth;

        return {
            top: portrait ? 36 : 18,
            right: 24,
            bottom: portrait ? 34 : 18,
            left: 24
        };
    }

    applyInputDefaults() {
        if (!this.isMobile) return;

        this.scene.input.setDefaultCursor("default");
        this.scene.input.topOnly = true;
    }

    getParticleMultiplier() {
        if (this.quality === "low") return 0.35;
        if (this.quality === "medium") return 0.65;
        return 1;
    }

    getShakeMultiplier() {
        if (!this.isMobile) return 1;
        if (this.quality === "low") return 0.55;
        if (this.quality === "medium") return 0.75;
        return 0.9;
    }

    getUIScale() {
        if (!this.isMobile) return 1;
        return window.innerWidth < 700 ? 0.82 : 0.9;
    }

    async requestFullscreenAndLandscape() {
        if (!this.isMobile) return false;

        try {
            if (!this.scene.scale.isFullscreen && this.scene.scale.startFullscreen) {
                this.scene.scale.startFullscreen();
            }

            if (screen.orientation?.lock) {
                await screen.orientation.lock("landscape").catch(() => {});
            }

            return true;
        } catch (error) {
            console.warn("Mobile fullscreen/orientation request failed:", error);
            return false;
        }
    }
}
