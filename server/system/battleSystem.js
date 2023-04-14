const ELEMENT_EFFECTIVENESS_TABLE = [
	[1, 2, 0.5, 1, 1], // ELEMENT.FIRE  0
	[0.5, 1, 2, 1, 1], // ELEMENT.WOOD  1
	[2, 0.5, 1, 1, 1], // ELEMENT.WATER 2
	[1, 1, 1, 1, 2], // ELEMENT.LIGHT 3
	[1, 1, 1, 2, 1], // ELEMENT.DARK  4
];
export const randomInt = (min, max) => {
	return Math.random() * (max - min) + min;
};

export default class BattleSystem {
	constructor(players, monsters) {
		this.players = players;
		this.monsters = monsters;
		this.turnQueue = [];
		this.turns = 0;
		this.ready = 0;
		this.initializeQueue();
	}

	initializeQueue() {
		const queue = [...this.players, ...this.monsters];
		queue.sort((a, b) => b.stats.SPEED - a.stats.SPEED);
		this.turnQueue = queue;
	}

	queueRemove(entity) {
		this.turnQueue = this.turnQueue.filter((e) => e.id != entity.id);
	}

	queueAdd(entity) {
		this.turnQueue.push(entity);
	}

	calculateDamage(player, monster) {
		const elementEffectiveness =
			ELEMENT_EFFECTIVENESS_TABLE[player.stats.ELEMENT][monster.stats.ELEMENT];
		const damage =
			(((((2 * player.stats.LEVEL) / 5 + 2) * player.stats.ATK) /
				monster.stats.DEF) *
				elementEffectiveness *
				randomInt(217, 255)) /
			255;
		return { damage: Math.max(damage, 1), elementEffectiveness };
	}

	updateTurn() {
		const attacker = this.turnQueue.splice(0, 1)[0]; // Take first element from queue
		this.turnQueue.push(attacker); // Put attacker as last element in queue
		this.turns++;
	}
}
