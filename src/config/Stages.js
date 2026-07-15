export const Stages = {
    1: {
        id: 1,
        name: "DEEP SPACE",
        background: "background_space",
        boss: "alpha",

        waves: {
            1: ["scout","scout","scout","scout","fighter","scout","scout","fighter","scout","scout"],
            2: ["scout","fighter","scout","fighter","scout","scout","fighter","scout","fighter","scout","scout","fighter"],
            3: ["fighter","scout","fighter","bomber","scout","fighter","scout","bomber","fighter","scout","fighter","scout"],
            4: ["fighter","bomber","fighter","scout","bomber","fighter","scout","fighter","bomber","fighter"],
            5: ["fighter","bomber","fighter","bomber","fighter"]
        },

        rules: {
            asteroids: false,
            storm: false
        }
    },

    2: {
        id: 2,
        name: "ASTEROID BELT",
        background: "background_stage2",
        boss: "omega",

        waves: {
            1: ["scout","fighter","scout","interceptor","fighter","scout","interceptor","fighter"],
            2: ["fighter","fighter","mine_layer","fighter","scout","mine_layer","fighter"],
            3: ["fighter","mine_layer","bomber","fighter","mine_layer","bomber","scout"],
            4: ["interceptor","fighter","interceptor","mine_layer","fighter","interceptor","mine_layer"],
            5: ["interceptor","mine_layer","fighter","bomber","interceptor","mine_layer","bomber","fighter"]
        },

        rulesByWave: {
            1: { asteroids: false, storm: false },
            2: { asteroids: false, storm: false },
            3: { asteroids: true, storm: false },
            4: { asteroids: true, storm: true },
            5: { asteroids: true, storm: true }
        }
    },

    3: {
    id: 3,
    name: "NEBULA SECTOR",
    background: "background_stage3",
    boss: "leviathan",
    titleColor: "#22c55e",
    spawnDelay: 1250,

    waves: {
        1: ["fighter","interceptor","fighter","scout","interceptor","fighter","scout"],
        2: ["interceptor","mine_layer","fighter","interceptor","fighter","bomber"],
        3: ["mine_layer","bomber","interceptor","fighter","mine_layer","bomber"],
        4: ["interceptor","interceptor","mine_layer","bomber","fighter","interceptor","mine_layer"],
        5: ["bomber","mine_layer","interceptor","bomber","fighter","mine_layer","interceptor"]
    },

    rulesByWave: {
        1: { asteroids: false, storm: false },
        2: { asteroids: false, storm: false },
        3: { asteroids: false, storm: false },
        4: { asteroids: false, storm: false },
        5: { asteroids: false, storm: false }
    }
    },

    4: {
        id: 4,
        name: "ION STORM FRONTIER",
        background: "background_stage3",
        boss: "alpha",
        titleColor: "#22D3EE",
        spawnDelay: 1050,
        waves: {
            1: ["sniper","fighter","kamikaze","scout","sniper","fighter","kamikaze","shield_carrier"],
            2: ["kamikaze","interceptor","sniper","medic","fighter","shield_carrier","kamikaze","bomber"],
            3: ["shield_carrier","sniper","heavy_cruiser","fighter","medic","kamikaze","interceptor"],
            4: ["heavy_cruiser","sniper","kamikaze","shield_carrier","medic","interceptor","sniper","kamikaze"],
            5: ["heavy_cruiser","shield_carrier","medic","sniper","kamikaze","elite","heavy_cruiser"]
        },
        rulesByWave: {
            1: { asteroids: false, storm: true },
            2: { asteroids: true, storm: true },
            3: { asteroids: true, storm: true },
            4: { asteroids: true, storm: true },
            5: { asteroids: true, storm: true }
        }
    }
,
    5: {
        id: 5,
        name: "QUANTUM RIFT",
        background: "background_quantum_rift",
        boss: "omega",
        titleColor: "#A78BFA",
        spawnDelay: 940,
        waves: {
            1: ["sniper","kamikaze","interceptor","shield_carrier","fighter","sniper","medic","kamikaze"],
            2: ["heavy_cruiser","sniper","shield_carrier","medic","interceptor","kamikaze","fighter"],
            3: ["kamikaze","kamikaze","sniper","heavy_cruiser","shield_carrier","elite"],
            4: ["medic","heavy_cruiser","sniper","interceptor","shield_carrier","kamikaze","elite"],
            5: ["heavy_cruiser","elite","sniper","shield_carrier","medic","heavy_cruiser","kamikaze"]
        },
        rulesByWave: {
            1: { asteroids: false, storm: true },
            2: { asteroids: false, storm: true },
            3: { asteroids: true, storm: true },
            4: { asteroids: true, storm: true },
            5: { asteroids: true, storm: true }
        }
    },

    6: {
        id: 6,
        name: "FROZEN VOID",
        background: "background_frozen_void",
        boss: "leviathan",
        titleColor: "#7DD3FC",
        spawnDelay: 880,
        waves: {
            1: ["shield_carrier","sniper","fighter","heavy_cruiser","medic","interceptor"],
            2: ["kamikaze","sniper","shield_carrier","heavy_cruiser","elite","medic"],
            3: ["heavy_cruiser","heavy_cruiser","sniper","kamikaze","shield_carrier","elite"],
            4: ["medic","elite","shield_carrier","sniper","heavy_cruiser","kamikaze","interceptor"],
            5: ["elite","heavy_cruiser","shield_carrier","sniper","medic","elite","heavy_cruiser"]
        },
        rulesByWave: {
            1: { asteroids: false, storm: false },
            2: { asteroids: true, storm: false },
            3: { asteroids: true, storm: true },
            4: { asteroids: true, storm: true },
            5: { asteroids: true, storm: true }
        }
    }

};

export function getStageConfig(stageId) {
    return Stages[stageId] || null;
}