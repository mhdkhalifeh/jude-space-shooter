export default class WaveGenerator {
    static generate(stage = 1, wave = 1) {
        const difficulty = stage * 10 + wave;

        const enemyPool = this.getEnemyPool(difficulty);
        const enemyCount = this.getEnemyCount(difficulty);

        const result = [];

        for (let i = 0; i < enemyCount; i++) {
            result.push(this.pickEnemy(enemyPool));
        }

        return result;
    }

    static getEnemyPool(difficulty) {
        const pool = [];

        pool.push({ type: "scout", weight: 40 });

        if (difficulty >= 8) {
            pool.push({ type: "fighter", weight: 35 });
        }

        if (difficulty >= 18) {
            pool.push({ type: "bomber", weight: 20 });
        }

        if (difficulty >= 22) {
            pool.push({ type: "interceptor", weight: 25 });
        }

        if (difficulty >= 28) {
            pool.push({ type: "mine_layer", weight: 18 });
        }

        if (difficulty >= 35) {
            pool.push({ type: "elite", weight: 6 });
        }

        return pool;
    }

    static getEnemyCount(difficulty) {
        return Math.min(18, 6 + Math.floor(difficulty / 5));
    }

    static pickEnemy(pool) {
        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const item of pool) {
            roll -= item.weight;

            if (roll <= 0) {
                return item.type;
            }
        }

        return "scout";
    }

    static getRules(stage = 1, wave = 1) {
        const difficulty = stage * 10 + wave;

        return {
            asteroids: difficulty >= 32,
            storm: difficulty >= 38 && wave % 2 === 0
        };
    }
}