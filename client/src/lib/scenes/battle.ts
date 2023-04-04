import { SCALE, SPEED } from "../constants";
import { generateEasyMonsters } from "../rpg/monster";
import Battle from "../rpg/systems/battleSystem";
import { ELEMENT } from "../rpg/utils";
import Scene from "./scene";

export default class BattleScene extends Scene {
	public centerPoint: any;
	public battle: any;
	public monsters: any;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}
	preload() {
		this.load.spritesheet("player", "sprites/spritesheet.png", {
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

		// Create center point
		this.centerPoint = this.add.sprite(0, 50, "player");
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
			HP: 10,
			ATK: 10,
			DEF: 10,
			SPEED: 10,
			ELEMENT: ELEMENT.LIGHT,
			LEVEL: 1,
		};
		this.players.push(this.player);

		// Setup camera to follow player
		this.cameras.main.startFollow(this.centerPoint, true, 0.03, 0.03);

		this.game.currentScene = "battle";

		let monsters = generateEasyMonsters(3);
		this.monsters = [];
		monsters.forEach((monster: any, index: number) => {
			// TODO: update sprite
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
			monsterSprite.stats = monster.stats;
			this.monsters.push(monsterSprite);
		});
		this.battle = new Battle(this.players, this.monsters);

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
		// Update player
		let speed = SPEED;
		const movement = Object.values(this.player.movement).filter(
			(v) => v
		).length;
		if (movement > 1) speed *= 0.71;
		if (this.player.movement.left) this.player.x -= speed;
		if (this.player.movement.up) this.player.y -= speed;
		if (this.player.movement.right) this.player.x += speed;
		if (this.player.movement.down) this.player.y += speed;
		if (
			this.player.movement.left &&
			!this.player.flipX &&
			!this.player.movement.right
		) {
			this.player.facing = 0;
			this.player.flipX = true;
		} else if (
			this.player.movement.right &&
			this.player.flipX &&
			!this.player.movement.left
		) {
			this.player.facing = 1;
			this.player.flipX = false;
		}

		// Animate player
		if (this.player.animationState !== "idle" && movement === 0) {
			this.player.animationState = "idle";
			this.player.play("idle");
		} else if (this.player.animationState !== "run" && movement > 0) {
			this.player.animationState = "run";
			this.player.play("run");
		}

		// Render depth of player
		this.player.setDepth(this.player.y);

		// Multiplayer test
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
