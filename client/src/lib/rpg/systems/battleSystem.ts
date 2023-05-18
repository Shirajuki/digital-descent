import { randomInt } from "../../utils";
import { ELEMENT_EFFECTIVENESS_TABLE } from "../../constants";

type StateType = {
	type:
		| "initial"
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
		damage: { damage: number; elementEffectiveness: number }[];
	};
	timer?: { current: number; end: number };
};

export default class BattleSystem {
	public players: any[];
	public monsters: any[];
	public turnQueue: any[];
	public turns = 0;
	public state: StateType = {
		type: "initial",
		attacker: null,
		target: null,
		text: "",
		running: false,
		finished: false,
		initialPosition: { x: 0, y: 0 },
		attack: {
			effects: {},
			damage: [{ damage: 0, elementEffectiveness: 1 }],
		},
		timer: { current: 0, end: 100 },
	};
	public playerTarget: any = null;
	public actionText = "";
	public actionQueue: any = [];
	public leveling = {
		levelUp: true,
		exp: 0,
		ready: false,
		display: false,
	};
	public drops = [
		{ item: "Dummy drop", amount: 1 },
		{ item: "Code fragment", amount: 1 },
		{ item: "Cash", amount: 10 },
	];

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

	applyEffect(entity: any, effect: string) {
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
				(e: any) => !["burn", "memoryLeak", "nervous", "lag"].includes(e.type)
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
		entity.effects = entity.effects.filter((e: any, i: number) => {
			const index = entity.effects.findIndex((e2: any) => e2.type === e.type);
			if (index === i) return true;
			else {
				entity.effects[index].duration = Math.max(
					entity.effects[index].duration,
					e.duration
				);
				return false;
			}
		});

		console.log("APPLY EFFECT", effect, entity.effects);
	}

	updateEffects(entity: any) {
		if (entity.effects) {
			entity.effects.forEach((e: any) => {
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
			entity.effects = entity.effects.filter((e: any) => e.duration > 0);
		}
	}

	checkValidAttack(attack: any, state: any) {
		if (attack.targets.type === "monster") {
			return state.target.type == "monster";
		}
		return true;
	}

	doAttack(type: "normal" | "charge" | "special", id: string) {
		if (type === "normal") {
			console.log("normal");
			if (!this.state.attacker) {
				const player = this.players.find((p) => p.id === id);
				const attack = player.skills.normal;
				const state = {
					type: attack.animationType,
					attacker: player,
					target: this.state.target ?? this.monsters[0],
					text: attack.name,
					running: true,
					finished: false,
					initialPosition: { x: player.x, y: player.y },
				};
				if (!this.checkValidAttack(attack, state)) return;
				const channel = window.channel;
				if (channel) {
					channel.emit("battle-turn", {
						attack: attack,
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
				const attack = player.skills.charge;

				const state = {
					type: attack.animationType,
					attacker: player,
					target: this.state.target ?? this.monsters[0],
					text: attack.name,
					running: true,
					finished: false,
					initialPosition: { x: player.x, y: player.y },
				};
				const attacker = {
					id: player.id,
					stats: player.stats,
					battleStats: player.battleStats,
				};
				const target = {
					id: state.target.id,
					stats: state.target.stats,
					battleStats: state.target.battleStats,
				};
				if (attacker.battleStats.CHARGE >= attack.chargeCost) {
					attacker.battleStats.CHARGE = Math.max(
						attacker.battleStats.CHARGE - attack.chargeCost,
						0
					);
				} else {
					return console.log("Nope");
				}
				if (!this.checkValidAttack(attack, state)) return;
				const channel = window.channel;
				if (channel) {
					channel.emit("battle-turn", {
						attack: attack,
						state: {
							...state,
							attacker: attacker,
							target: attack.targets.amount === "self" ? attacker : target,
						},
					});
				}
				this.playerTarget = state.target;
				console.log(this.state.target);
			}
		} else if (type === "special") {
			console.log("special");
			if (!this.state.attacker) {
				const player = this.players.find((p) => p.id === id);
				const attack = player.skills.special;

				const state = {
					type: attack.animationType,
					attacker: player,
					target: this.state.target ?? this.monsters[0],
					text: attack.name,
					running: true,
					finished: false,
					initialPosition: { x: player.x, y: player.y },
				};
				const attacker = {
					id: player.id,
					stats: player.stats,
					battleStats: player.battleStats,
				};
				const target = {
					id: state.target.id,
					stats: state.target.stats,
					battleStats: state.target.battleStats,
				};
				if (attacker.battleStats.CHARGE >= attack.chargeCost) {
					attacker.battleStats.CHARGE = Math.max(
						attacker.battleStats.CHARGE - attack.chargeCost,
						0
					);
				} else {
					return console.log("Nope");
				}
				if (!this.checkValidAttack(attack, state)) return;
				const channel = window.channel;
				if (channel) {
					channel.emit("battle-turn", {
						attack: attack,
						state: {
							...state,
							attacker: attacker,
							target: attack.targets.amount === "self" ? attacker : target,
						},
					});
				}
				this.playerTarget = state.target;
				console.log(this.state.target);
			}
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
