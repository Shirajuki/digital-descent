import { randomInt } from "../../utils";
import { ELEMENT_EFFECTIVENESS_TABLE } from "../../constants";
import Observable from "../observable";

export default class BattleSystem {
	public players: any[];
	public monsters: any[];
	public turnQueue: any[];
	public observable = new Observable();
	public state: any = {
		attacker: null,
		target: null,
		attacking: false,
		attacked: false,
		initialPosition: { x: 0, y: 0 },
	};
	public playerTarget: any = null;

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

	queueRemove(entity: any) {
		this.turnQueue = this.turnQueue.filter((e) => e != entity);
	}

	queueAdd(entity: any) {
		this.turnQueue.push(entity);
	}

	calculateDamage(player: any, monster: any) {
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

	doAttack(type: "normal" | "charge" | "special") {
		if (type === "normal") {
			console.log("normal");
			// TODO: pick correct player at certain position and index
			if (!this.state.attacker) {
				this.state = {
					attacker: this.players[0],
					target: this.state.target ?? this.monsters[0],
					attacking: true,
					attacked: false,
					initialPosition: { x: this.players[0].x, y: this.players[0].y },
				};
				this.playerTarget = this.state.target;
			}
		} else if (type === "charge") {
			console.log("charge");
		} else if (type === "special") {
			console.log("special");
		}
	}

	updateTurn() {
		const attacker = this.turnQueue.splice(0, 1)[0]; // Take first element from queue
		this.turnQueue.push(attacker); // Put attacker as last element in queue
		this.observable.notify();

		const nextTurn = this.turnQueue[0];
		if (nextTurn?.type === "monster") {
			// TODO: pick random players weighted by taunt level
			this.state = {
				attacker: nextTurn,
				target: this.players[0],
				attacking: true,
				attacked: false,
				initialPosition: { x: nextTurn.x, y: nextTurn.y },
			};
		} else {
			// Update pointer to the next alive monster if players turn next
			if (this.playerTarget.battleStats.dead)
				this.state.target = this.monsters.find((e) => !e.battleStats.dead);
			else this.state.target = this.playerTarget;
		}
	}
}

export {};
