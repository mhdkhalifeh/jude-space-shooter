export default class CreditsManager {
    constructor(scene, saveManager) {
        this.scene = scene;
        this.saveManager = saveManager;
    }

    getBalance() {
        return this.saveManager?.getCredits?.() ?? 0;
    }

    add(amount, reason = "REWARD") {
        const value = Math.max(0, Math.floor(Number(amount) || 0));
        if (value <= 0) return 0;
        this.saveManager?.addCredits?.(value);
        this.scene?.hud?.updateCredits?.(this.getBalance());
        return value;
    }

    spend(amount) {
        const value = Math.max(0, Math.floor(Number(amount) || 0));
        const ok = this.saveManager?.spendCredits?.(value) === true;
        if (ok) this.scene?.hud?.updateCredits?.(this.getBalance());
        return ok;
    }
}
