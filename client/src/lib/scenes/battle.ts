import { SCALE } from "../constants";
import { generateEasyMonsters } from "../rpg/monster";
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
			ATK: 10,
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
		let monsters = generateEasyMonsters(3);
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
			monsterSprite.name = monster.name;
			monsterSprite.stats = monster.stats;
			monsterSprite.battleStats = monster.battleStats;

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
				if (!this.battle.state.attacking)
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
		if (
			this.battle?.state?.attacker &&
			this.battle?.state?.attacker?.id === this.player.id
		) {
			if (!this.battle.state.attacked) {
				this.tweens.add({
					targets: this.battle.state.attacker,
					x: this.battle.state.target.x + 30,
					y: this.battle.state.target.y + 1,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
				if (
					Math.abs(this.battle.state.attacker.x - this.battle.state.target.x) <
						70 &&
					Math.abs(this.battle.state.attacker.y - this.battle.state.target.y) <
						70
				) {
					if (!this.battle.state.attacked) {
						const dmg = this.battle.calculateDamage(
							this.battle.state.attacker,
							this.battle.state.target
						);
						console.log(dmg);
						this.battle.state.target.battleStats.HP = Math.max(
							this.battle.state.target.battleStats.HP - dmg.damage,
							0
						);
						this.battle.state.attacker.battleStats.CHARGE = Math.min(
							this.battle.state.attacker.battleStats.CHARGE + 1,
							this.battle.state.attacker.battleStats.MAXCHARGE
						);
						console.log(this.battle.state.attacker.battleStats.CHARGE);
					}
					this.battle.state.attacked = true;
					this.tweens.add({
						targets: this.battle.state.target,
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
					targets: this.battle.state.attacker,
					x: this.playerLocations[0].x,
					y: this.playerLocations[0].y,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
				if (
					Math.abs(this.battle.state.attacker.x - this.playerLocations[0].x) <
						10 &&
					Math.abs(this.battle.state.attacker.y - this.playerLocations[0].y) <
						10
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
			x: this.battle?.state?.target?.x ?? this.monsters[0].x,
			y: (this.battle?.state?.target?.y ?? this.monsters[0].y) - 50,
			depth: (this.battle?.state?.target?.y ?? this.monsters[0].y) + 1,
			ease: "Linear",
			duration: 100,
			delay: 0,
			repeat: -1,
		});

		// Update monster HP using lerp
		for (let i = 0; i < this.monsters.length; i++) {
			const monster = this.monsters[i];
			monster.hp.width = Phaser.Math.Linear(
				monster.hp.width,
				80 * (monster.battleStats.HP / monster.stats.HP),
				0.05
			);
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
