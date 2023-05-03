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
		const queue = [...this.players, ...this.monsters];
		queue.sort((a, b) => b.stats.SPEED - a.stats.SPEED);
		this.turnQueue = queue;
	}

	queueRemove(entity) {
		this.turnQueue = this.turnQueue.filter((e) => e.id != entity.id);
	}

	calculateDamage(attacker, target) {
		// TODO: Take into account player and monster stats
		// TODO: Take into account player and monster status effects
		const atkbuff =
			attacker?.effects?.some((e) => e.type === "attackBoost") || undefined;
		const defbuff =
			target?.effects?.some((e) => e.type === "defenceBoost") || undefined;
		const damage =
			(((((2 * attacker.stats.LEVEL) / 5 + 2) *
				(attacker.stats.ATK * (atkbuff ? 1.2 : 1))) /
				target.stats.DEF) *
				(defbuff ? 1.2 : 1) *
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
			(4 * Math.pow(player.stats.LEVEL, 3)) / 5
		);
		if (player.stats.EXP >= experienceToNextLevel) {
			player.stats.LEVEL++;
			player.stats.EXP -= experienceToNextLevel;
			player.stats.HP += 10;
			player.stats.SP += 10;
			player.battleStats.HP += player.stats.HP;
			player.battleStats.SP += player.stats.SP;
			player.stats.ATK += 1;
			player.stats.DEF += 1;
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

	updateTurn() {
		const attacker = this.turnQueue.splice(0, 1)[0]; // Take first element from queue
		this.turnQueue.push(attacker); // Put attacker as last element in queue
		this.turns++;
	}
}
