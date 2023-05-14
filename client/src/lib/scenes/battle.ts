import { CANVAS_HEIGHT, NAMES, SCALE } from "../constants";
import {
	MONSTER_PRESET_BY_RISKLEVEL,
	customer,
	generateMonstersByPreset,
} from "../rpg/monster";
import BattleSystem from "../rpg/systems/battleSystem";
import Scene from "./scene";
import Observable from "../observable";
import { initializePlayer } from "../rpg/player";
import {
	addPlayers,
	removeDuplicatePlayers,
	reorderPlayers,
} from "../rpg/sync";
import { animateSingleAttack, animateStandingAttack } from "../rpg/animation";
import { lerp, weightedRandom } from "../utils";
import { randomInt } from "../utils";

/*
engine.game.scene.getScene(engine.game.currentScene).switch("battle")
*/

export default class BattleScene extends Scene {
	public texts: any[] = [];
	public centerPoint: any; // Camera focuspoint
	public pointerSprite: any;
	public battle = new BattleSystem([], []); // Battle System
	public monsters: any;
	public newBattle = true;
	public scrollingBackground: any[] = [];

	// Attack animation variables
	public currentAttackDelay = 0;
	public attackDelay = 50;
	public currentBuffDelay = 0;
	public buffDelay = 40;
	public currentWaitDelay = 0;
	public waitDelay = 90;

	// Player starting location
	public playerLocations = [
		{ x: 200, y: 0 },
		{ x: 180, y: -70 },
		{ x: 220, y: 70 },
		{ x: 270, y: -35 },
		{ x: 290, y: 35 },
	];
	// Monster starting location
	public monsterLocations = [
		{ x: -200, y: 0 },
		{ x: -180, y: -70 },
		{ x: -220, y: 70 },
		{ x: -270, y: -35 },
		{ x: -290, y: 35 },
	];

	// Tween garbage collect timer
	public tweenTimer = 0;
	public tweenTimerMax = 500;

	public help = {
		display: false,
		ready: false,
	};

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		// Load all monster sprites
		this.load.spritesheet("monsterBug", "sprites/bug.png", {
			frameWidth: 320,
			frameHeight: 320,
		});
	}
	create() {
		super.create();
		// Animation set
		this.anims.create({
			key: "jump",
			frames: this.anims.generateFrameNumbers("player", {
				frames: [0, 23, 23, 24, 24, 0, 1, 2, 3],
			}),
			duration: 200,
			frameRate: 4,
			repeat: -1,
		});

		// Monster idle animations
		this.anims.create({
			key: "monsterBugIdle",
			frames: this.anims.generateFrameNumbers("monsterBug", {
				frames: [0, 0, 1, 1],
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.preloaded = true;
		this.initialize();
	}

	initialize(): void {
		if (!this.preloaded) return;
		super.initialize();

		// Setup background
		this.cameras.main.setBackgroundColor(0x1f1f1f);
		for (let i = 0; i < this.scrollingBackground.length; i++) {
			this.scrollingBackground[i].destroy();
		}
		this.scrollingBackground = [];
		setTimeout(() => {
			const colors = [0x888888, 0x888888, 0x888888, 0x888888];
			for (let i = 0; i < 20; i++) {
				const bg = this.add.rectangle(
					-750 + i * 75,
					-750 + i * 75,
					50,
					CANVAS_HEIGHT * 3,
					colors[i % colors.length]
				);
				bg.setRotation(Math.PI / 4);
				bg.setDepth(-10000);
				bg.setAlpha(0.05);
				(bg as any).scrollSpeed = 0.5;
				this.scrollingBackground.push(bg);
			}
		}, 500);

		// Create center point for camera lock on
		if (this.centerPoint) this.centerPoint.destroy();
		this.centerPoint = this.add.rectangle(0, 50, 50, 50, 0xffffff);
		this.centerPoint.setVisible(false);

		// Create player
		const oldPlayer = this.player;
		this.player = initializePlayer(this, "Player 1", oldPlayer);
		this.players = [
			...this.players.filter((p) => p?.id !== oldPlayer?.id),
			this.player,
		];
		// Set own player to be clickable
		this.player.setInteractive();
		this.player.on("pointerup", () => {
			if (!this.battle.state.running && !this.player.battleStats.dead) {
				this.battle.state.target = this.battle.players.find(
					(p) => p.id === this.player.id
				);
				this.observable.notify();
			}
		});

		// Setup camera to follow centerpoint
		this.cameras.main.startFollow(this.centerPoint, true, 0.03, 0.03);

		// Generate monsters
		const preset = MONSTER_PRESET_BY_RISKLEVEL[1];
		let monsters = generateMonstersByPreset(
			preset[Math.floor(Math.random() * preset.length)]
		);
		// monsters = generateMonstersByPreset(["easy"]); // TEST
		if (this.game.data.returnBackTo === "newoffice") {
			monsters = [customer()];
		}
		this.monsters = [];

		// Initialize battle
		this.battle = new BattleSystem(this.players, this.monsters);
		const channel = window.channel;
		if (channel) {
			channel.emit("battle-initialize", {
				players: this.players.map((p) => p.id),
				monsters: monsters.map((m: any, i: number) => {
					return {
						id: "monster" + i,
						name: m.name,
						stats: m.stats,
						battleStats: m.battleStats,
						type: m.type,
						monsterType: m.monsterType,
					};
				}),
			});
		}
		this.newBattle = true;

		// Create pointer on top of first monster
		this.battle.state.target = this.battle.monsters[0];
		if (this.pointerSprite) this.pointerSprite.destroy();
		this.pointerSprite = this.add.rectangle(
			this.monsterLocations[0].x,
			this.monsterLocations[0].y - 50,
			25,
			15,
			0xffffff
		) as any;
		this.observable.notify();
		setTimeout(() => {
			this.observable.notify();
		}, 1000);

		if (this.game.currentScene === "battle") {
			setTimeout(() => {
				const channel = window.channel;
				if (channel) {
					channel.emit("dialogue", { scenario: "BATTLE_INTRO" });
				}
			}, 500);
		}
	}

	getMonsterSprite(type: string) {
		if (type === "BUG") return ["monsterBug", 0.3];
		return ["player", 1];
	}

	sync(data: any) {
		const channel = window.channel;
		if (data.type === "battle-lose") {
			if (this.game.data.returnBackTo === "newoffice") {
				channel.emit("dialogue", {
					scenario: "CUSTOMER_MEETING_LOSE",
					forceall: true,
				});
			}
			this.switch(this.game.data.returnBackTo);
			channel?.emit("message-send", {
				sender: "[battle]",
				message: "Battle lost",
				private: true,
			});
		} else if (data.type === "leveling-update") {
			const players = data.players;
			this.players.forEach((p) => {
				const player = players.find((pl: any) => pl.id === p.id);
				if (player) {
					p.stats = player.stats;
				}
			});
		} else if (data.type === "leveling-end") {
			// Reset all players by changing out the id
			window.oldPlayer = this.player;
			for (let i = 0; i < this.players.length; i++) {
				const player = this.players[i];
				player.id = "entityKill" + i;
				player.name = "entityKill" + i;
			}

			if (this.game.data.returnBackTo === "newoffice") {
				channel.emit("dialogue", {
					scenario: "CUSTOMER_MEETING_WIN",
					forceall: true,
				});
			}
			this.switch(this.game.data.returnBackTo);
			channel?.emit("message-send", {
				sender: "[battle]",
				message: "Battle ended",
				private: true,
			});
		} else if (data.type === "battle-end") {
			console.log("Battle ended");
			// Update quest clearing
			const currentTasks = this.game.data.currentTasks;
			if (currentTasks) {
				for (let i = currentTasks.length - 1; i >= 0; i--) {
					const task = currentTasks[i];
					if (task?.type === "BUGS") {
						for (let j = 0; j < this.monsters.length; j++) {
							const m = this.monsters[j];
							if (m.monsterType === "BUG") {
								task.currentCount++;
								task.progress = Math.ceil(
									(100 / task.count) * task.currentCount
								);
							}
						}
						console.log(task);
						if (task.progress >= 100) {
							task.progress = 100;
							currentTasks.splice(i, 1);
							this.game.data.solvedTasks.push(task);

							// Reward players
							const rewards = task.rewards;
							this.game.data.money += rewards.money;
							this.player.stats.exp += rewards.exp;
						}
					}
				}
			}

			const leveling = data.leveling;
			const players = data.players;
			this.battle.leveling.ready = leveling.ready;
			this.battle.leveling.display = leveling.display;

			const player = players.find((pl: any) => pl.id === this.player.id);
			this.player.stats = player.stats;
			this.battle.leveling.exp = player.exp;
			this.battle.leveling.levelUp = player.levelUp;

			this.battle.addActionQueue({
				type: "text-update",
				attacker: null,
				target: null,
				text: `Battle ended`,
				running: true,
				finished: false,
				initialPosition: this.battle.state.initialPosition,
				attack: {
					effects: {},
					damage: [{ damage: 0, elementEffectiveness: 1 }],
				},
				timer: { current: 0, end: 100 },
			});
			if (!this.battle.state.running) this.battle.updateActionQueue();
		} else if (data.type === "battle-pointer") {
			this.battle.updatePointer();
		} else if (data.type === "battle-turn") {
			const state = data.state;
			const attacker =
				this.players.find((p) => p.id === data.state.attacker) ||
				this.monsters.find((m: any) => m.id === data.state.attacker);
			const target =
				this.players.find((p) => p.id === data.state.target) ||
				this.monsters.find((m: any) => m.id === data.state.target);
			if (attacker?.effects?.some((e: any) => e.type === "memoryleak")) {
				this.battle.addActionQueue({
					type: "text-update",
					attacker: null,
					target: target,
					text: `${attacker.name} is leaking memory, taking damage`,
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 100 },
				});
				this.battle.addActionQueue({
					type: "skip",
					attacker: null,
					target: target,
					text: "",
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 50 },
				});
				this.battle.addActionQueue({
					type: "text-update",
					attacker: null,
					target: target,
					text: "",
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 50 },
				});
			}
			if (attacker?.effects?.some((e: any) => e.type === "lag")) {
				this.battle.addActionQueue({
					type: "text-update",
					attacker: null,
					target: target,
					text: `${attacker.name} is lagging, turn skipped`,
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 100 },
				});
				this.battle.addActionQueue({
					type: "skip",
					attacker: null,
					target: target,
					text: "",
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 50 },
				});
				this.battle.addActionQueue({
					type: "text-update",
					attacker: null,
					target: target,
					text: "",
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 50 },
				});
			} else {
				this.battle.addActionQueue({
					type: "text-update",
					attacker: null,
					target: target,
					text: `${attacker.name} used ${state.text} on ${target.name}`,
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 25 },
				});
				this.battle.addActionQueue({
					...state,
					attacker: attacker,
					target: target,
					initialPosition: { x: attacker.x, y: attacker.y },
					attack: data.attack,
				});
				this.battle.addActionQueue({
					type: "text-update",
					attacker: null,
					target: target,
					text: "",
					running: true,
					finished: false,
					initialPosition: this.battle.state.initialPosition,
					attack: {
						effects: {},
						damage: [{ damage: 0, elementEffectiveness: 1 }],
					},
					timer: { current: 0, end: 50 },
				});
			}
			console.log("UPDATE state....", data, this.battle.state, this.battle);
			console.log(this.battle.actionQueue);
			this.battle.updateEffects(attacker);
			if (!this.battle.state.running) this.battle.updateActionQueue();
		} else if (data.type === "battle-initialize") {
			// Update monsters
			for (let i = 0; i < this?.monsters?.length; i++) {
				const m = this.monsters[i];
				m.hp.destroy();
				m.destroy();
			}
			this.monsters = [];
			for (let index = 0; index < data.battle.monsters.length; index++) {
				const monster = data.battle.monsters[index];
				const [spriteType, scaling] = this.getMonsterSprite(
					monster.monsterType
				);
				console.log(
					monster.monsterType === "BUG",
					monster.monsterType,
					spriteType
				);
				const monsterSprite = this.add.sprite(
					this.monsterLocations[index].x,
					this.monsterLocations[index].y,
					spriteType as string
				) as any;

				monsterSprite.setScale(SCALE);
				if (monster.monsterType === "BUG") {
					monsterSprite.play(spriteType + "Idle");
				} else {
					monsterSprite.play("idle");
				}
				monsterSprite.setDepth(monsterSprite.y);
				monsterSprite.setScale(scaling);
				monsterSprite.flipX = false;
				monsterSprite.animationState = "idle";
				monsterSprite.name = monster.name;
				monsterSprite.stats = monster.stats;
				monsterSprite.battleStats = monster.battleStats;
				monsterSprite.type = monster.type;
				monsterSprite.monsterType = monster.monsterType;
				monsterSprite.effects = monster.effects;
				monsterSprite.id = "monster" + index;

				// Create hp bar on top of sprite
				const monsterSpriteHp = this.add.rectangle(
					monsterSprite.x,
					monsterSprite.y - 30,
					80,
					5,
					0x22c55e
				);
				monsterSpriteHp.setDepth(1000);
				monsterSprite.hp = monsterSpriteHp;
				this.monsters.push(monsterSprite);
			}
			// Reinitialize battle
			this.battle = new BattleSystem(this.players, this.monsters);
			// Set monster to be clickable
			this.monsters.forEach((monster: any, index: number) => {
				// Recheck duplicate and remove
				this.children.list.forEach((e: any, i: number) => {
					if (e?.id === monster.id && e !== monster) {
						e.hp.destroy();
						this.children.remove(e);
					}
				});

				monster.setInteractive();
				monster.on("pointerup", () => {
					if (!this.battle.state.running && !monster.battleStats.dead) {
						this.battle.state.target = this.battle.monsters[index];
						this.observable.notify();
					}
				});
			});

			this.observable.notify();
		} else if (data.type === "battle-update") {
			const serverPlayers = Object.keys(data.players).filter(
				(p: any) => p != "undefined"
			);
			const serverPlayersData = serverPlayers.map((p) => data.players[p]);

			removeDuplicatePlayers(this, serverPlayers);

			addPlayers(this, serverPlayers, serverPlayersData);

			// Update player position
			for (let i = 0; i < this.players.length; i++) {
				const player = this.players[i];
				// Relocate player starting position
				if (player.id === this.player?.id) {
					this.player.x = this.playerLocations[window.playerIndex].x;
					this.player.y = this.playerLocations[window.playerIndex].y;
					this.player.name =
						window.playerName || NAMES[window.playerIndex || 0];
					continue;
				}
				player.x = data.players[player.id].x;
				player.y = data.players[player.id].y;

				// Set depth
				player.setDepth(player.y);
			}

			const isOrdered = reorderPlayers(this, serverPlayers);
			// Update BattleHUD
			if (!isOrdered || this.newBattle) {
				this.newBattle = false;
				const channel = window.channel;
				if (channel) {
					channel.emit("battle-initialize", {
						players: this.players?.map((p) => p.id) || [],
						monsters: this.monsters.map((m: any) => {
							return {
								name: m.name,
								stats: m.stats,
								battleStats: m.battleStats,
								type: m.type,
								monsterType: m.monsterType,
							};
						}),
					});
				}
				this.observable.notify();
			}
		}
	}

	update(_time: any, _delta: any) {
		super.update(_time, _delta);
		// Animate battle attacking state for player
		if (this.battle?.state.type === "single-attack") {
			animateSingleAttack(this);
		} else if (this.battle?.state.type === "standing-attack") {
			animateStandingAttack(this);
		} else if (this.battle?.state.type === "special-attack") {
		} else if (this.battle?.state.type === "text-update") {
			this.battle.actionText = this.battle?.state.text;
			this.observable.notify();
			if (this.battle.state.timer) {
				if (this.battle.state.timer.current < this.battle.state.timer.end) {
					this.battle.state.timer.current++;
				} else if (!this.battle.state.finished) {
					this.battle.state.finished = true;
					this.battle.state.running = false;
				}
			}
			if (this.battle.state.finished) {
				this.battle.state.finished = false;
				this.battle.state.running = false;
				this.battle.updateActionQueue();
				const channel = window.channel;
				if (
					this.battle.actionText !== "" &&
					channel &&
					this.battle.actionText !== "Battle ended"
				)
					channel?.emit("message-send", {
						sender: "[battle]",
						message: this.battle.actionText,
						private: true,
					});
				this.observable.notify();
			}
		} else if (this.battle?.state.type === "skip") {
			if (!this.battle.state.finished) {
				this.battle.state.finished = true;
				this.battle.state.running = false;
				this.battle.updateActionQueue();
				this.battle.updateTurn();
				this.observable.notify();
				// Turn finished
				const channel = window.channel;
				if (channel)
					channel.emit("battle-turn-finished", {
						turns: this.battle.turns,
					});

				// If players turn and no target is chosen, pick first monster
				if (!this.battle.playerTarget) {
					this.battle.state.target = this.battle.monsters.find(
						(e: any) => !e.battleStats.dead
					);
					this.battle.playerTarget = this.battle.state.target;
				}
			}
		}

		// Move pointer to player's target monster
		if (
			!(
				(this.battle?.state.type === "text-update" ||
					this.battle?.state.type === "skip") &&
				this.battle?.state.running
			)
		) {
			this.tweens.add({
				targets: this.pointerSprite,
				x: this.battle?.state?.target?.x ?? -2000,
				y: (this.battle?.state?.target?.y ?? -2000) - 50,
				depth:
					(this.battle?.state?.target?.y ?? this.monsterLocations[0].y) + 1,
				ease: "Linear",
				duration: 100,
				delay: 0,
				repeat: -1,
			});
		}

		// Fade hitIndicator
		for (let i = 0; i < this.texts.length; i++) {
			const text = this.texts[i];
			text.scale = Phaser.Math.Linear(text.scale, 1.5, 0.01);
			text.alpha = Phaser.Math.Linear(text.alpha, 0, 0.06);
			text.x = Phaser.Math.Linear(text.x, text?.target?.x ?? 0, 0.015);
			text.y = Phaser.Math.Linear(text.y, text?.target?.y ?? 0, 0.01);
			if (text.alpha < 0.01) {
				this.texts.splice(i, 1);
				text.destroy();
			}
		}

		// Update monster HP using lerp
		let monsterHasEffects = false;
		for (let i = 0; i < this.monsters.length; i++) {
			const monster = this.monsters[i];
			if (monster.battleStats.dead) {
				this.tweens.add({
					targets: monster,
					alpha: 0,
					ease: "Linear",
					duration: 300,
					delay: 0,
					repeat: -1,
				});
				this.tweens.add({
					targets: monster.hp,
					alpha: 0,
					ease: "Linear",
					duration: 300,
					delay: 0,
					repeat: -1,
				});
				continue;
			}
			monster.hp.width = Phaser.Math.Linear(
				monster.hp.width,
				80 * (monster.battleStats.HP / monster.stats.HP),
				0.08
			);
			monster.hp.x = monster.x;
			monster.hp.y = monster.y - 30;

			// Check and set monster dead status if hp == 0
			if (monster.hp.width < 0.1) {
				console.log("Killed monster", monster.name);
				monster.battleStats.dead = true;
				this.battle.queueRemove(monster);
			}

			// Check and see if any monster has effect, if so, update Effect HUD
			if (!monsterHasEffects) monsterHasEffects = monster?.effects?.length;
		}
		if (monsterHasEffects) this.observable.notify("effect");
		// Render depth of player
		this.player.setDepth(this.player.y);

		// Update name entity to player position
		// Update shadow color and move to player position
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			player.nameEntity.x = player.x;
			player.nameEntity.y = player.y - 40;
			player.nameEntity.setDepth(player.y + 1);

			if (player.shadow.fillColor !== 0xffffff) {
				player.shadow.fillColor = 0xffffff;
				player.shadow.strokeColor = 0xffffff;
			}
			player.shadow.x = player.x;
			player.shadow.y = player.y + 35;
			player.shadow.setDepth(player.y - 1);
			if (this.battle.turnQueue[0] === player) {
				player.shadow.setAlpha(lerp(player.shadow.alpha, 0.05, 0.05));
			} else {
				player.shadow.setAlpha(lerp(player.shadow.alpha, 0, 0.05));
			}
		}

		// Update scrolling background
		for (let i = 0; i < this.scrollingBackground.length; i++) {
			const bg = this.scrollingBackground[i];
			bg.x += bg.scrollSpeed;
			bg.y += bg.scrollSpeed;
			if (bg.x > 750) {
				bg.x = -750;
				bg.y = -750;
			}
		}

		// If tween timer is over, remove all tweens
		if (
			this.tweenTimer > this.tweenTimerMax &&
			this.battle.actionQueue.length === 0
		) {
			this.tweens.killAll();
			this.tweenTimer = 0;
		} else {
			this.tweenTimer++;
		}

		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("battle-update", {
				player: this.player.getData(),
				battle: this.battle,
			});
		}
	}
}
