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
    }
};

export function getStageConfig(stageId) {
    return Stages[stageId] || null;
}