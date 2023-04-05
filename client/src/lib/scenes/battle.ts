import { SCALE } from "../constants";
import { generateMonstersByPreset } from "../rpg/monster";
import BattleSystem from "../rpg/systems/battleSystem";
import { ELEMENT } from "../constants";
import Scene from "./scene";

export default class BattleScene extends Scene {
	public centerPoint: any;
	public battle: any;
	public monsters: any;
	public pointerSprite: any;
	public playerLocations = {
		0: { x: 200, y: 0 },
		1: { x: 200, y: -70 },
		2: { x: 200, y: 70 },
		3: { x: 270, y: -35 },
		4: { x: 270, y: 35 },
	};

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}
	preload() {
		// Load player sprites
		this.load.spritesheet("player", "sprites/spritesheet.png", {
			frameWidth: 32,
			frameHeight: 32,
		});

		// Load player customization / accessories
		// TODO: add head accessories
		// TODO: add other accessories

		// Load all monster sprites
		this.load.spritesheet("monster", "sprites/spritesheet.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
	}
	create() {
		super.create();

		// Animation set
		this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNumbers("player", {
				frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			}),
			frameRate: 10,
			repeat: -1,
		});
		this.anims.create({
			key: "run",
			frames: this.anims.generateFrameNumbers("player", {
				frames: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
			}),
			frameRate: 20,
			repeat: -1,
		});

		// Create center point for camera lock on
		this.centerPoint = this.add.rectangle(0, 50, 50, 50, 0xffffff);
		this.centerPoint.setVisible(false);

		// Create player
		this.player = this.add.sprite(200, 0, "player");
		this.player.setScale(SCALE);
		this.player.flipX = true;
		this.player.play("idle");
		this.player.movement = {
			left: false,
			up: false,
			right: false,
			down: false,
		};
		this.player.animationState = "idle";
		this.player.stats = {
			HP: 100,
			ATK: 20,
			DEF: 10,
			SPEED: 10,
			ELEMENT: ELEMENT.LIGHT,
			LEVEL: 1,
		};
		this.player.battleStats = {
			HP: 100,
			CHARGE: 0,
			MAXCHARGE: 5,
		};
		this.player.name = "Player 1";
		this.players.push(this.player);

		// Setup camera to follow player
		this.cameras.main.startFollow(this.centerPoint, true, 0.03, 0.03);

		this.game.currentScene = "battle";

		// Generate monsters
		let monsters = generateMonstersByPreset(["easy", "easy", "easy"]);
		this.monsters = [];
		monsters.forEach((monster: any, index: number) => {
			// TODO: update sprite with actual sprite image
			// Create monster sprite
			const monsterSprite = this.add.sprite(
				-200 - 20 * index,
				70 * index - 70 * Math.floor(monsters.length / 2),
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

		this.battle = new BattleSystem(this.players, this.monsters);

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
				if (!this.battle.state.attacking && !monster.battleStats.dead)
					this.battle.state.target = this.battle.monsters[index];
			});
		});

		// Update battle state in server if not set yet
		const channel = (window as any).channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("battle-initialize", {
				id: channel.id,
				battle: this.battle,
			});
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
					x: target.x + 30 * (attacker.x > target.x ? 1 : -1),
					y: target.y + 1,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
				if (
					Math.abs(attacker.x - target.x) < 70 &&
					Math.abs(attacker.y - target.y) < 70
				) {
					if (!this.battle.state.attacked) {
						const dmg = this.battle.calculateDamage(attacker, target);
						console.log(dmg);
						target.battleStats.HP = Math.max(
							target.battleStats.HP - dmg.damage,
							0
						);
						attacker.battleStats.CHARGE = Math.min(
							attacker.battleStats.CHARGE + 1,
							attacker.battleStats.MAXCHARGE
						);
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
				this.tweens.add({
					targets: attacker,
					x: this.battle.state.initialPosition.x,
					y: this.battle.state.initialPosition.y,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
				if (
					Math.abs(attacker.x - this.battle.state.initialPosition.x) < 10 &&
					Math.abs(attacker.y - this.battle.state.initialPosition.y) < 10
				) {
					this.battle.state.attacking = false;
					this.battle.state.attacked = false;
					this.battle.state.attacker = null;
					this.battle.updateTurn();
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
		// TODO: Make this battle-update
		const channel = (window as any).channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", {
				id: channel.id,
				x: this.player.x,
				y: this.player.y,
				movement: this.player.movement,
				stats: this.player.stats,
			});
		}
	}
}
