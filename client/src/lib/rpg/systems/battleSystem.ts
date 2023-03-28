import { randomInt } from "../../utils";
import { ELEMENT_EFFECTIVENESS_TABLE } from "../utils";

export default class Battle {
	public players: any[];
	public monsters: any[];
	public turnQueue: any[];

	constructor(players: any[], monsters: any[]) {
		this.players = players;
		this.monsters = monsters;
		this.turnQueue = [];
		this.initializeQueue();
		console.log("INITIALIZE BATTLE", players, monsters);
		console.log(this.turnQueue);

		(window as any).battle = this;
	}

	initializeQueue() {
		const queue = [...this.players, ...this.monsters];
		queue.sort((a, b) => b.stats.SPEED - a.stats.SPEED);
		this.turnQueue = queue;
	}
	calculateDamage(player: any, monster: any) {
		const elementEffectiveness =
			ELEMENT_EFFECTIVENESS_TABLE[player.stats.ELEMENT][monster.stats.ELEMENT];
		const damage =
			(((((2 * player.stats.level) / 5 + 2) * player.stats.ATK) /
				monster.stats.DEF) *
				elementEffectiveness *
				randomInt(217, 255)) /
			255;
		return { damage: Math.max(damage, 1), elementEffectiveness };
	}

	doTurn() {
		const attacker = this.turnQueue.splice(0, 1)[0]; // Take first element from queue
		console.log(attacker);
		this.turnQueue.push(attacker); // Put attacker as last element in queue
	}
}

export {};
