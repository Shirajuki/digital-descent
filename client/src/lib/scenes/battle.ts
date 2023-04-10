import { SCALE } from "../constants";
import { generateMonstersByPreset } from "../rpg/monster";
import BattleSystem from "../rpg/systems/battleSystem";
import Scene from "./scene";
import Observable from "../observable";
import { initializePlayer } from "../rpg/player";

/*
engine.game.scene.getScene(engine.game.currentScene).switch("exploration")
engine.game.scene.getScene(engine.game.currentScene).switch("battle")
*/

export default class BattleScene extends Scene {
	public text: any; // Damage indicator text
	public centerPoint: any; // Camera focuspoint
	public pointerSprite: any;
	public battle: any; // Battle System
	public monsters: any;

	// Attack animation variables
	public currentAttackDelay = 0;
	public attackDelay = 50;

	// Player starting location
	public playerLocations = [
		{ x: 200, y: 0 },
		{ x: 180, y: -70 },
		{ x: 220, y: 70 },
		{ x: 270, y: -35 },
		{ x: 290, y: 35 },
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
		this.anims.create({
			key: "land",
			frames: this.anims.generateFrameNumbers("player", {
				frames: [24],
			}),
			frameRate: 60,
			repeat: -1,
		});
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

		// Setup texts
		this.text = this.add.text(0, 0, "", {
			fontFamily: "Arial",
			fontSize: "32px",
			color: "#ffffff",
			stroke: "#000000",
			strokeThickness: 6,
		});
		this.text.setAlpha(0);
		this.text.setScale(0);
		this.text.setDepth(1000);
		this.text.setText("9001");
		this.text.setOrigin(0.5, 0.5);

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
			...this.players.filter((p) => p.id !== oldPlayer?.id),
			this.player,
		];

		// Setup camera to follow centerpoint
		this.cameras.main.startFollow(this.centerPoint, true, 0.03, 0.03);

		// Generate monsters
		let monsters = generateMonstersByPreset(["easy", "easy", "easy"]);
		this.monsters = [];
		monsters.forEach((monster: any, index: number) => {
			// TODO: update sprite with actual sprite image
			// Create monster sprite
			const monsterSprite = this.add.sprite(
				-200 - 20 * index,
				70 * index - 70 * Math.floor(monsters.length / 2),
				"monster"
			) as any;
			monsterSprite.setScale(SCALE);
			monsterSprite.play("idle");
			monsterSprite.setDepth(monsterSprite.y);
			monsterSprite.flipX = false;
			monsterSprite.animationState = "idle";
			monsterSprite.name = monster.name + " " + index;
			monsterSprite.stats = monster.stats;
			monsterSprite.battleStats = monster.battleStats;
			monsterSprite.type = monster.type;

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
		});

		// Initialize battle
		this.battle = new BattleSystem(this.players, this.monsters);
		const channel = (window as any).channel;
		if (channel) {
			channel.emit("battle-initialize", {
				players: this.players.map((p) => p.id),
				monsters: this.monsters.map((m: any, i: number) => {
					return {
						id: "monster" + i,
						name: m.name,
						stats: m.stats,
						battleStats: m.battleStats,
						type: m.type,
					};
				}),
			});
		}

		// Create pointer on top of first monster
		this.pointerSprite = this.add.rectangle(
			this.monsters[0].x,
			this.monsters[0].y - 50,
			25,
			15,
			0xffffff
		) as any;

		// Set monster to be clickable
		this.monsters.forEach((monster: any, index: number) => {
			monster.setInteractive();
			monster.on("pointerup", () => {
				if (!this.battle.state.attacking && !monster.battleStats.dead) {
					this.battle.state.target = this.battle.monsters[index];
					this.battle.playerTarget = this.battle.monsters[index];
				}
			});
		});

		this.observable.notify();
	}

	sync(data: any) {
		if (data.type === "battle-turn") {
			const state = data.state;
			const attacker =
				this.players.find((p) => p.id === data.state.attacker) ||
				this.monsters.find((m: any) => m.id === data.state.attacker);
			const target =
				this.players.find((p) => p.id === data.state.target) ||
				this.monsters.find((m: any) => m.id === data.state.target);
			this.battle.state = {
				...state,
				attacker: attacker,
				target: target,
			};
			this.battle.damage = data.damage;
			console.log("UPDATE state....", data, this.battle.state, this.battle);
		} else if (data.type === "battle-initialize") {
			// Update monsters
			this.monsters.forEach((m: any) => {
				m.hp.destroy();
				m.destroy();
			});
			this.monsters = [];
			data.battle.monsters.forEach((monster: any, index: number) => {
				const monsterSprite = this.add.sprite(
					-200 - 20 * index,
					70 * index - 70 * Math.floor(data.battle.monsters.length / 2),
					"player"
				) as any;
				monsterSprite.setScale(SCALE);
				monsterSprite.play("idle");
				monsterSprite.setDepth(monsterSprite.y);
				monsterSprite.flipX = false;
				monsterSprite.animationState = "idle";
				monsterSprite.name = monster.name + " " + index;
				monsterSprite.stats = monster.stats;
				monsterSprite.battleStats = monster.battleStats;
				monsterSprite.type = monster.type;
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
			});
			// Reinitialize battle
			this.battle = new BattleSystem(this.players, this.monsters);
			// Set monster to be clickable
			this.monsters.forEach((monster: any, index: number) => {
				monster.setInteractive();
				monster.on("pointerup", () => {
					if (!this.battle.state.attacking && !monster.battleStats.dead)
						this.battle.state.target = this.battle.monsters[index];
				});
			});

			this.observable.notify();
		}
		if (data.type === "battle-update") {
			const serverPlayers = Object.keys(data.players).filter(
				(p: any) => p != "undefined"
			);
			const serverPlayersData = serverPlayers.map((p) => data.players[p]);

			// Remove disconnected players
			for (let i = 0; i < this.players.length; i++) {
				const player = this.players[i];
				if (
					!serverPlayers.includes(player.id) &&
					this.player.id !== player.id
				) {
					const p = this.players.splice(i, 1)[0];
					p.destroy();
				}
			}

			// Add new players if found
			const clientPlayers = this.players.map((player: any) => player.id);
			for (let i = 0; i < serverPlayers.length; i++) {
				if (!clientPlayers.includes(serverPlayers[i])) {
					const player: any = initializePlayer(this, serverPlayersData[i].id);
					player.id = serverPlayersData[i].id;
					player.name = serverPlayersData[i].id;
					this.players.push(player);
				}
			}

			// If clientPlayers and serverPlayers mismatch
			if (clientPlayers.join() !== serverPlayers.join()) {
				// Reorder clientPlayers to be like serverPlayers
				const orderedPlayers = serverPlayers.map((pid: string) =>
					this.players.find((p) => p.id === pid)
				);
				this.players = orderedPlayers;
				if (!this.players.find((p) => p === this.player)) {
					this.players.find((p) => p.id === this.player?.id)?.destroy();
					this.players = this.players.map((p) =>
						p.id === this.player?.id ? this.player : p
					);
				}
			}

			// Update player position
			for (let i = 0; i < this.players.length; i++) {
				const player = this.players[i];
				// Relocate player starting position
				if (player.id === this.player.id) {
					this.player.x = this.playerLocations[i].x;
					this.player.y = this.playerLocations[i].y;
					continue;
				}
				player.x = data.players[player.id].x;
				player.y = data.players[player.id].y;

				// Reset player animation
				if (!player.flipX) player.flipX = true;
				if (player.animationState !== "idle") {
					player.animationState = "idle";
					player.play("idle");
				}

				// Set depth
				player.setDepth(player.y);
			}

			// Update BattleHUD
			if (clientPlayers.join() !== serverPlayers.join()) {
				const channel = (window as any).channel;
				if (channel) {
					channel.emit("battle-initialize", {
						players: this.players.map((p) => p.id),
						monsters: this.monsters.map((m: any) => {
							return {
								name: m.name,
								stats: m.stats,
								battleStats: m.battleStats,
								type: m.type,
							};
						}),
					});
				}
				this.observable.notify();
			}
		}
	}

	update(_time: any, _delta: any) {
		// Animate battle attacking state for player
		const attacker = this.battle?.state?.attacker;
		const target = this.battle?.state?.target;
		if (attacker && target) {
			if (!this.battle.state.attacked) {
				this.tweens.add({
					targets: attacker,
					x: target.x + 50 * (attacker.x > target.x ? 1 : -1),
					y: target.y + 1,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 400,
					repeat: -1,
				});
				if (attacker?.animationState === "idle") {
					attacker.play("jump");
					attacker.animationState = "jump";
				}
				if (
					Math.abs(attacker.x - target.x) < 70 &&
					Math.abs(attacker.y - target.y) < 70
				) {
					if (!this.battle.state.attacked) {
						this.currentAttackDelay = this.attackDelay;
						// Attacked
						if (attacker?.animationState === "jump") {
							attacker.play("idle");
							attacker.animationState = "idle";
						}
						console.log(this.battle.damage);
						target.battleStats.HP = Math.max(
							target.battleStats.HP - this.battle.damage.damage,
							0
						);
						attacker.battleStats.CHARGE = Math.min(
							attacker.battleStats.CHARGE + 1,
							attacker.battleStats.MAXCHARGE
						);
						// Display hitIndicator
						const dmg = "" + Math.floor(this.battle.damage.damage * 100) / 100;
						this.text.setText(dmg);
						this.text.x = target.x;
						this.text.y = target.y + 20;
						this.text.setScale(1);
						this.text.setAlpha(1);
						this.text.target = {
							x: target.x + 150 * (attacker.type === "monster" ? 1 : -1),
							y: target.y - 50,
						};
					}
					this.battle.state.attacked = true;
					this.tweens.add({
						targets: target,
						alpha: 0,
						ease: "Cubic.easeOut",
						delay: 140,
						duration: 100,
						repeat: 1,
						yoyo: true,
					});
				}
			} else {
				this.currentAttackDelay--;
				if (this.currentAttackDelay < 0) {
					this.tweens.add({
						targets: attacker,
						x: this.battle.state.initialPosition.x,
						y: this.battle.state.initialPosition.y,
						ease: "Back.easeOut",
						duration: 2000,
						delay: 500,
						repeat: -1,
					});
					if (attacker?.animationState === "idle") {
						attacker.play("jump");
						attacker.animationState = "jump";
						attacker.flipX = !attacker.flipX;
					}
				}
				if (
					Math.abs(attacker.x - this.battle.state.initialPosition.x) < 10 &&
					Math.abs(attacker.y - this.battle.state.initialPosition.y) < 10
				) {
					// Reset attacker movement
					if (attacker?.animationState === "jump") {
						attacker.play("idle");
						attacker.animationState = "idle";
						attacker.flipX = !attacker.flipX;
					}
					this.battle.state.attacking = false;
					this.battle.state.attacked = false;
					this.battle.state.attacker = null;
					this.battle.updateTurn();
					this.observable.notify();
				}
			}
		}

		// Move pointer to player's target monster
		this.tweens.add({
			targets: this.pointerSprite,
			x: this.battle?.state?.target?.x ?? -2000,
			y: (this.battle?.state?.target?.y ?? -2000) - 50,
			depth: (this.battle?.state?.target?.y ?? this.monsters[0].y) + 1,
			ease: "Linear",
			duration: 100,
			delay: 0,
			repeat: -1,
		});

		// Fade hitIndicator
		this.text.scale = Phaser.Math.Linear(this.text.scale, 1.5, 0.01);
		this.text.alpha = Phaser.Math.Linear(this.text.alpha, 0, 0.06);
		this.text.x = Phaser.Math.Linear(
			this.text.x,
			this.text?.target?.x ?? 0,
			0.015
		);
		this.text.y = Phaser.Math.Linear(
			this.text.y,
			this.text?.target?.y ?? 0,
			0.01
		);

		// Update monster HP using lerp
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
		}
		// Render depth of player
		this.player.setDepth(this.player.y);

		// Multiplayer test
		const channel = (window as any).channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("battle-update", {
				player: this.player.getData(),
				battle: this.battle,
			});
		}
	}
}
