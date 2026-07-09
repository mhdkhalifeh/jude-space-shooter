export const EnemyTypes = {
    scout: {
        texture: "enemy_scout",
        hp: 1,
        speed: 150,
        score: 10,
        scale: 0.08,
        movement: "straight"
    },

    fighter: {
        texture: "enemy_fighter",
        hp: 3,
        speed: 120,
        score: 20,
        scale: 0.10,
        movement: "wave",
        waveAmplitude: 80,
        waveSpeed: 0.004
    },

    bomber: {
        texture: "enemy_bomber",
        hp: 6,
        speed: 80,
        score: 50,
        scale: 0.18,
        movement: "straight"
    },

    interceptor: {
        texture: "enemy_interceptor",
        hp: 2,
        speed: 260,
        score: 35,
        scale: 0.085,
        movement: "interceptor",
        dashAmplitude: 140,
        dashSpeed: 0.010
    },

    mine_layer: {
        texture: "enemy_minelayer",
        hp: 8,
        speed: 70,
        score: 80,
        scale: 0.18,

        movement: "mine_layer",

        waveAmplitude: 40,
        waveSpeed: 0.0025,

        mineCooldown: 2500
    },

    elite: {
    texture: "enemy_elite",

    hp: 18,

    speed: 170,

    score: 250,

    scale: 0.14,

    movement: "wave",

    waveAmplitude: 120,

    waveSpeed: 0.006,

    elite: true
}
};