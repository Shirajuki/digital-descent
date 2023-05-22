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
		this.levelReady = 0;
		this.initializeQueue();
	}

	initializeQueue() {
		// sort scene.players by alphabetical order on name
		this.players.sort((a, b) => {
			if (a?.name < b?.name) return -1;
			if (a?.name > b?.name) return 1;
			return 0;
		});

		const queue = [...this.players, ...this.monsters];
		queue.sort((a, b) => b.stats.SPEED - a.stats.SPEED);
		this.turnQueue = queue;
	}

	queueRemove(entity) {
		this.turnQueue = this.turnQueue.filter((e) => e.id != entity.id);
	}

	getAttack(monster) {
		if (monster.monsterType === "BUG") {
			return ["Bug Bite", "Error", "Crash"][Math.floor(Math.random() * 3)];
		}
		if (monster.monsterType === "VIRUS") {
			return ["Infect", "Spread"][Math.floor(Math.random() * 2)];
		}
		if (monster.monsterType.startsWith("CUSTOMER")) {
			return ["Unclear Requirements", "Feature Request", "Dissatisfaction"][
				Math.floor(Math.random() * 3)
			];
		}
		return "Bash";
	}

	calculateDamage(attacker, target, attack = null) {
		// Calculate damage
		let attackModifier = 1;
		const atkbuff =
			attacker?.effects?.some((e) => e.type === "attackBoost") || false;
		if (attack?.power) attackModifier += attack.power;
		if (atkbuff) attackModifier += 0.3;

		const defbuff =
			target?.effects?.some((e) => e.type === "defenceBoost") || false;
		const nervous = target?.effects?.some((e) => e.type === "nervous") || false;
		let defenceModifier = defbuff ? 1.5 : 1;
		if (nervous) defenceModifier -= 0.3;
		const damage =
			(((((2 * attacker.stats.LEVEL) / 5 + 2) *
				(attacker.stats.ATK * attackModifier)) /
				(target.stats.DEF * defenceModifier)) *
				randomInt(217, 255)) /
			255;
		return { damage: Math.max(damage, 1), elementEffectiveness: 1 };
	}

	calculateExperience(monsters) {
		let experience = 0;
		for (const monster of monsters) {
			const baseExperience = monster.stats.LEVEL * 2.5 + monster.stats.HP / 10;
			experience += Math.floor(baseExperience);
		}
		return experience;
	}

	calculateLevelUp(player) {
		const experienceToNextLevel = Math.floor(
			(4 * Math.pow(player.stats.LEVEL, 2)) / 6 + 10
		);
		if (player.stats.EXP >= experienceToNextLevel) {
			player.stats.LEVEL++;
			player.stats.EXP -= experienceToNextLevel;
			player.stats.HP += 10;
			player.stats.SP += 10;
			player.battleStats.HP += player.stats.HP;
			player.stats.ATK += 1;
			player.stats.DEF += 1;
			player.stats.LUCK += 1;
			player.stats.SPEED += 1;
			return true;
		}
		return false;
	}

	applyEffects(entity, effect) {
		// Set effects on entity
		if (!entity.effects) entity.effects = [];
		// Apply new effect
		if (effect === "smallHeal") {
			entity.battleStats.HP = Math.min(
				entity.battleStats.HP + 5,
				entity.stats.HP
			);
		} else if (effect === "mediumHeal") {
			entity.battleStats.HP = Math.min(
				entity.battleStats.HP + 20,
				entity.stats.HP
			);
		} else if (effect === "bigHeal") {
			entity.battleStats.HP = entity.battleStats.HP;
		} else if (effect === "clear") {
			entity.effects = entity.effects.filter(
				(e) => !["burn", "memoryLeak", "nervous", "lag"].includes(e.type)
			);
		} else if (effect === "lag") {
			entity.effects.push({ type: "lag", duration: 2 });
		} else if (effect === "nervous") {
			entity.effects.push({ type: "nervous", duration: 2 });
		} else if (effect === "memoryLeak") {
			entity.effects.push({ type: "memoryLeak", duration: 2 });
		} else if (effect === "burn") {
			entity.effects.push({ type: "burn", duration: 1 });
		} else if (effect === "fire") {
			entity.effects.push({ type: "fire", duration: 2 });
		} else if (effect === "attackBoost") {
			entity.effects.push({ type: "attackBoost", duration: 2 });
		} else if (effect === "defenceBoost") {
			entity.effects.push({ type: "defenceBoost", duration: 2 });
		} else if (effect === "taunt") {
			entity.effects.push({ type: "taunt", duration: 4 });
		}
		// Remove duplicate effects and update duration using filter
		entity.effects = entity.effects.filter((e, i) => {
			const index = entity.effects.findIndex((e2) => e2.type === e.type);
			if (index === i) return true;
			else {
				entity.effects[index].duration = Math.max(
					entity.effects[index].duration,
					e.duration
				);
				return false;
			}
		});

		console.log("[...] Applying", effect, "on", entity.name || entity.id);
	}

	updateEffects(entity) {
		if (entity.effects) {
			entity.effects.forEach((e) => {
				if (e.type === "burn") {
					entity.battleStats.HP = Math.max(
						entity.battleStats.HP - entity.stats.HP * 0.1,
						1
					);
				} else if (e.type === "memoryLeak") {
					entity.battleStats.HP = Math.max(
						entity.battleStats.HP - entity.stats.HP * 0.1,
						1
					);
				}
				e.duration--;
			});
			entity.effects = entity.effects.filter((e) => e.duration > 0);
		}
	}

	pickPlayerByWeighting(players) {
		// Calculate players weight
		const playersWeight = players.map((p) => {
			let weight = p.battleStats.HP;
			if (p.effects.find((e) => e.type === "nervous")) weight *= 0.5;
			if (p.effects.find((e) => e.type === "taunt")) weight += 400;
			return { player: p, weight };
		});
		// Pick player by highest weight
		const player = playersWeight.reduce((prev, current) =>
			prev.weight > current.weight ? prev : current
		);
		return player.player;
	}

	updateTurn() {
		const attacker = this.turnQueue.splice(0, 1)[0]; // Take first element from queue
		this.turnQueue.push(attacker); // Put attacker as last element in queue
		this.turns++;
	}
}
