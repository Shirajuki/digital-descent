import { SCALE } from "../constants";
import { generateMonstersByPreset } from "../rpg/monster";
import BattleSystem from "../rpg/systems/battleSystem";
import Scene from "./scene";
import Observable from "../observable";
import { initializePlayer } from "../rpg/player";
import { removeDuplicatePlayers, reorderPlayers } from "../rpg/sync";
import { animateSingleAttack, animateStandingAttack } from "../rpg/animation";

/*
engine.game.scene.getScene(engine.game.currentScene).switch("battle")
*/

export default class BattleScene extends Scene {
	public texts: any[] = [];
	public centerPoint: any; // Camera focuspoint
	public pointerSprite: any;
	public battle = new BattleSystem([], []); // Battle System
	public monsters: any;

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

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		// Load all monster sprites
		this.load.spritesheet("monster", "sprites/spritesheet2.png", {
			frameWidth: 32,
			frameHeight: 32,
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
		// TODO: add correct animation for all the monster types
		this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNumbers("monster", {
				frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			}),
			frameRate: 10,
			repeat: -1,
		});
		this.anims.create({
			key: "run",
			frames: this.anims.generateFrameNumbers("monster", {
				frames: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
			}),
			frameRate: 20,
			repeat: -1,
		});

		this.preloaded = true;
		this.initialize();
	}

	initialize(): void {
		if (!this.preloaded) return;
		super.initialize();

		// Create center point for camera lock on
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
		let monsters = generateMonstersByPreset(["easy", "easy"]);
		this.monsters = [];

		// Initialize battle
		this.battle = new BattleSystem(this.players, this.monsters);
		const channel = window.channel;
		if (channel) {
			channel.emit("battle-initialize", {
				players: this.players.map((p) => p.id),
				monsters: monsters.map(
					(m: any, i: number) => {
						return {
							id: "monster" + i,
							name: m.name,
							stats: m.stats,
							battleStats: m.battleStats,
							type: m.type,
							monsterType: m.monsterType,
						};
					},
					{ reliable: true }
				),
			});
		}

		// Create pointer on top of first monster
		this.battle.state.target = this.battle.monsters[0];
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
	}

	sync(data: any) {
		const channel = window.channel;
		if (data.type === "leveling-update") {
			const players = data.players;
			this.players.forEach((p) => {
				const player = players.find((pl: any) => pl.id === p.id);
				if (player) {
					p.stats = player.stats;
				}
			});
		} else if (data.type === "leveling-end") {
			this.switch("exploration");
			channel?.emit(
				"message-send",
				{
					sender: "[battle]",
					message: "Battle ended",
					private: true,
				},
				{ reliable: true }
			);
		} else if (data.type === "battle-end") {
			console.log("Battle ended");
			// Update quest clearing
			const currentTasks = this.game.data.currentTasks;
			if (currentTasks) {
				for (let i = currentTasks.length - 1; i >= 0; i--) {
					const task = currentTasks[i];
					if (task?.type === "BUGS") {
						task.check();
						console.log(task);
						if (task.progress >= 100) {
							const solvedTask = currentTasks.splice(i, 1);
							this.game.data.solvedTasks.push(solvedTask);

							// Reward players
							// TODO: move this to serverside
							const rewards = task.rewards;
							this.player.stats.gold += rewards.money;
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
				const monsterSprite = this.add.sprite(
					this.monsterLocations[index].x,
					this.monsterLocations[index].y,
					"player"
				) as any;
				monsterSprite.setScale(SCALE);
				monsterSprite.play("idle");
				monsterSprite.setDepth(monsterSprite.y);
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

			// Add new players if found
			const clientPlayers = this.players.map((player: any) => player.id);
			for (let i = 0; i < serverPlayers.length; i++) {
				if (!clientPlayers.includes(serverPlayers[i])) {
					const player: any = initializePlayer(this, serverPlayersData[i].id);
					player.id = serverPlayersData[i].id;
					player.name = serverPlayersData[i].id;
					this.players.push(player);

					// Set players to be clickable
					player.setInteractive();
					player.on("pointerup", () => {
						if (!this.battle.state.running && !player.battleStats.dead) {
							this.battle.state.target = this.battle.players[i];
							this.observable.notify();
						}
					});
					setTimeout(() => {
						this.observable.notify();
					}, 1000);
				}
			}

			reorderPlayers(this, serverPlayers);

			// Update player position
			for (let i = 0; i < this.players.length; i++) {
				const player = this.players[i];
				// Relocate player starting position
				if (player.id === this.player?.id) {
					this.player.x = this.playerLocations[i].x;
					this.player.y = this.playerLocations[i].y;
					continue;
				}
				player.x = data.players[player.id].x;
				player.y = data.players[player.id].y;

				// Set depth
				player.setDepth(player.y);
			}

			// Update BattleHUD
			if (clientPlayers.join() !== serverPlayers.join()) {
				const channel = window.channel;
				if (channel) {
					channel.emit(
						"battle-initialize",
						{
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
						},
						{ reliable: true }
					);
				}
				this.observable.notify();
			}
		}
	}

	update(_time: any, _delta: any) {
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
					channel?.emit(
						"message-send",
						{
							sender: "[battle]",
							message: this.battle.actionText,
							private: true,
						},
						{ reliable: true }
					);
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
					channel.emit(
						"battle-turn-finished",
						{
							turns: this.battle.turns,
						},
						{ reliable: true }
					);
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

		// Multiplayer test
		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit(
				"battle-update",
				{
					player: this.player.getData(),
					battle: this.battle,
				},
				{ reliable: true }
			);
		}
	}
}
