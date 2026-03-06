export class GameEngine {
    constructor() {
        this.goal = 1_000_000;
        this.gold = 0;
        this.platinum = 0;
        this.gameWon = false;
        this.onGameWon = null;

        this.generators = {
            miner: { count: 1, cost: 10, rate: 1, upgradeCost: 20 },
            drill: { count: 0, cost: 50, rate: 5, upgradeCost: 50 },
            excavator: { count: 0, cost: 200, rate: 20, upgradeCost: 150 }
        };
    }

    buy(type) {
        const g = this.generators[type];
        if (this.gold < g.cost) return false;

        this.gold -= g.cost;
        g.count++;
        g.cost = Math.ceil(g.cost * 1.15);
        return true;
    }

    upgrade(type) {
        const g = this.generators[type];
        if (this.platinum < g.upgradeCost) return false;

        this.platinum -= g.upgradeCost;
        g.rate = +(g.rate * 1.2).toFixed(2);
        g.upgradeCost = Math.ceil(g.upgradeCost * 1.5);
        return true;
    }

    totalGenerators() {
        return Object.values(this.generators).reduce((sum, g) => sum + g.count, 0);
    }

    platinumChance() {
        const base = 0.10;
        const perGen = 0.001;
        const max = 0.25;

        return Math.min(base + this.totalGenerators() * perGen, max);
    }

    totalGoldPerTick() {
        return Object.values(this.generators).reduce((sum, g) => sum + g.count * g.rate, 0);
    }

    tick() {
        if (this.gameWon) return [];

        let events = [];

        // Platinum gain
        const chance = this.platinumChance();
        if (Math.random() < chance) {
            this.platinum++;
            events.push({ type: "platinum", amount: 1 });
        }

        // Gold gain
        const goldGain = this.totalGoldPerTick();
        this.gold += goldGain;

        if (goldGain > 0) {
            events.push({ type: "gold", amount: goldGain });
        }

        // Win condition
        if (this.gold >= this.goal && !this.gameWon) {
            this.gold = this.goal;
            this.gameWon = true;
            this.onGameWon?.();
        }

        return events;
    }
}
