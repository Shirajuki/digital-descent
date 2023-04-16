import { randomInt } from "../../utils";
import { ELEMENT_EFFECTIVENESS_TABLE } from "../../constants";

type StateType = {
	type:
		| "skip"
		| "single-attack"
		| "standing-attack"
		| "special-attack"
		| "text-update";
	attacker: any;
	target: any;
	text: string;
	running: boolean;
	finished: boolean;
	initialPosition: { x: number; y: number };
	attack: {
		effects: {
			attacker?: string[];
			attackerAccuracy?: number;
			target?: string[];
			targetAccuracy?: number;
		};
		damage: { damage: number; elementEffectiveness: number };
	};
	timer?: { current: number; end: number };
};

export default class BattleSystem {
	public players: any[];
	public monsters: any[];
	public turnQueue: any[];
	public turns = 0;
	public state: StateType = {
		type: "skip",
		attacker: null,
		target: null,
		text: "",
		running: false,
		finished: false,
		initialPosition: { x: 0, y: 0 },
		attack: {
			effects: {},
			damage: { damage: 0, elementEffectiveness: 1 },
		},
		timer: { current: 0, end: 100 },
	};
	public playerTarget: any = null;
	public actionText = "";
	public actionQueue: any = [];

	constructor(players: any[], monsters: any[]) {
		this.players = players;
		this.monsters = monsters;
		this.turnQueue = [];
		this.initializeQueue();
		console.log("INITIALIZE BATTLE", players, monsters);
		console.log(this.turnQueue);
		(window as any).battle = this;
		setTimeout(() => (this.state.target = monsters[0]), 300);
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

	doAttack(type: "normal" | "charge" | "special", id: string) {
		if (type === "normal") {
			console.log("normal");
			if (!this.state.attacker) {
				const player = this.players.find((p) => p.id === id);
				const attack = player.skills.normal;

				const state = {
					type: "single-attack",
					attacker: player,
					target: this.state.target ?? this.monsters[0],
					text: attack.name,
					running: true,
					finished: false,
					initialPosition: { x: player.x, y: player.y },
				};
				const channel = window.channel;
				if (channel) {
					channel.emit("battle-turn", {
						state: {
							...state,
							attacker: {
								id: player.id,
								stats: player.stats,
								battleStats: player.battleStats,
							},
							target: {
								id: state.target.id,
								stats: state.target.stats,
								battleStats: state.target.battleStats,
							},
						},
					});
				}
				this.playerTarget = state.target;
				console.log(this.state.target);
			}
		} else if (type === "charge") {
			console.log("charge");
			if (!this.state.attacker) {
				const player = this.players.find((p) => p.id === id);
				const attack = player.skills.normal;

				const state = {
					type: "standing-attack",
					attacker: player,
					target: this.state.target ?? this.monsters[0],
					text: attack.name,
					running: true,
					finished: false,
					initialPosition: { x: player.x, y: player.y },
				};
				const channel = window.channel;
				if (channel) {
					channel.emit("battle-turn", {
						state: {
							...state,
							attacker: {
								id: player.id,
								stats: player.stats,
								battleStats: player.battleStats,
							},
							target: {
								id: state.target.id,
								stats: state.target.stats,
								battleStats: state.target.battleStats,
							},
						},
					});
				}
				this.playerTarget = state.target;
				console.log(this.state.target);
			}
		} else if (type === "special") {
			console.log("special");
		}
	}

	updateTurn() {
		const attacker = this.turnQueue.splice(0, 1)[0]; // Take first element from queue
		this.turnQueue.push(attacker); // Put attacker as last element in queue
		this.turns++;
		this.updatePointer();
	}
	updatePointer() {
		const nextTurn = this.turnQueue[0];
		if (nextTurn.type !== "monster") {
			// Update pointer to the next alive monster if players turn next
			if (this.playerTarget?.battleStats?.dead)
				this.state.target = this.monsters.find((e) => !e.battleStats.dead);
			else this.state.target = this.playerTarget;
		}
	}
	addActionQueue(actionState: StateType) {
		this.actionQueue.push(actionState);
	}
	updateActionQueue() {
		if (this.actionQueue.length > 0) {
			const actionState = this.actionQueue.splice(0, 1)[0];
			console.log("RUNNING", actionState);
			this.state = actionState;
		}
	}
}
