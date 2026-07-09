export const BossTypes = {

    alpha: {
        texture: "boss_alpha",
        hp: 150,
        score: 1000,
        scale: 0.26,
        entryY: 160,
        fireDelay: 1000,

        moveSpeed: 0.9,
        moveAmplitude: 7,
        bulletPattern: "spread"
    },

    omega: {
        texture: "boss_omega",

        hp: 320,
        score: 3500,

        scale: 0.36,

        entryY: 175,

        fireDelay: 900,

        moveSpeed: 1.5,
        moveAmplitude: 12,

        bulletPattern: "plasma",

        mineDelay: 2600,

        dashCooldown: 5200,

        phase2HP: 0.66,
        phase3HP: 0.33
    }

};