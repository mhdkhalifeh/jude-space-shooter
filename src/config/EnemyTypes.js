export const EnemyTypes = {
    scout: { texture: "enemy_scout", hp: 1, speed: 150, score: 10, scale: 0.08, movement: "straight", tint: 0xffffff },
    fighter: { texture: "enemy_fighter", hp: 3, speed: 120, score: 20, scale: 0.10, movement: "wave", waveAmplitude: 80, waveSpeed: 0.004, tint: 0xffffff },
    bomber: { texture: "enemy_bomber", hp: 6, speed: 80, score: 50, scale: 0.18, movement: "straight", tint: 0xffffff },
    interceptor: { texture: "enemy_interceptor", hp: 2, speed: 260, score: 35, scale: 0.085, movement: "interceptor", dashAmplitude: 140, dashSpeed: 0.010, tint: 0xffffff },
    mine_layer: { texture: "enemy_minelayer", hp: 8, speed: 70, score: 80, scale: 0.18, movement: "mine_layer", waveAmplitude: 40, waveSpeed: 0.0025, mineCooldown: 2500, tint: 0xffffff },
    sniper: { texture: "enemy_fighter", hp: 5, speed: 95, score: 90, scale: 0.115, movement: "sniper", stopY: 145, shotCooldown: 2100, tint: 0x60a5fa },
    kamikaze: { texture: "enemy_interceptor", hp: 2, speed: 170, score: 65, scale: 0.09, movement: "kamikaze", chargeSpeed: 360, tint: 0xfb7185 },
    shield_carrier: { texture: "enemy_bomber", hp: 9, speed: 85, score: 130, scale: 0.16, movement: "wave", waveAmplitude: 55, waveSpeed: 0.003, shieldHits: 4, tint: 0x22d3ee },
    medic: { texture: "enemy_scout", hp: 6, speed: 105, score: 110, scale: 0.11, movement: "medic", waveAmplitude: 65, waveSpeed: 0.003, healCooldown: 2400, healAmount: 1, tint: 0x4ade80 },
    heavy_cruiser: { texture: "enemy_bomber", hp: 16, speed: 58, score: 220, scale: 0.22, movement: "heavy", shotCooldown: 1500, tint: 0xf97316 },
    elite: { texture: "enemy_elite", hp: 18, speed: 170, score: 250, scale: 0.14, movement: "wave", waveAmplitude: 120, waveSpeed: 0.006, elite: true, tint: 0xffaa00 }
};
