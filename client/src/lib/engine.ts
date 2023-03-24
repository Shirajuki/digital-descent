import { SCALE, SPEED } from "./constants";
import * as Phaser from "phaser";

class Scene extends Phaser.Scene {
	public players: any[] = [];
	public player: any;
	public text: any;

	preload() {
		this.load.spritesheet("player", "sprites/spritesheet.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
	}
	create() {
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

		// Create player
		this.player = this.add.sprite(200, 200, "player");
		this.player.setScale(SCALE);
		this.player.play("idle");
		this.player.movement = {
			left: false,
			up: false,
			right: false,
			down: false,
		};
		this.player.animationState = "idle";

		// Setup text
		this.text = this.add.text(15, 15, this.getSpriteInfo(), {
			fontFamily: "Arial",
			fontSize: "32px",
			color: "#fff",
		});

		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);

		// Keyboard input setup
		this.input.keyboard.on("keydown", (event: any) => {
			const { key } = event;
			if (key === "ArrowLeft" || key === "a") {
				this.player.movement.left = true;
				this.player.facing = 0;
			} else if (key === "ArrowUp" || key === "w") {
				this.player.movement.up = true;
			} else if (key === "ArrowRight" || key === "d") {
				this.player.movement.right = true;
				this.player.facing = 1;
			} else if (key === "ArrowDown" || key === "s") {
				this.player.movement.down = true;
			}
		});
		this.input.keyboard.on("keyup", (event: any) => {
			const { key } = event;
			if (key === "ArrowLeft" || key === "a") {
				this.player.movement.left = false;
			} else if (key === "ArrowUp" || key === "w") {
				this.player.movement.up = false;
			} else if (key === "ArrowRight" || key === "d") {
				this.player.movement.right = false;
			} else if (key === "ArrowDown" || key === "s") {
				this.player.movement.down = false;
			}
		});
	}
	getSpriteInfo() {
		return `
State: ${this.player.animationState}
Frame: ${
			this.player.animationState === "idle"
				? this.player.anims.currentFrame.index
				: this.player.anims.currentFrame.index + 10
		}
Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`.trim();
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

		// Update text
		this.text.text = this.getSpriteInfo();

		// Multiplayer test
		const channel = (window as any).channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("update", {
				id: channel.id,
				x: this.player.x,
				y: this.player.y,
				movement: this.player.movement,
			});
		}
	}
}

export default class PhaserEngine {
	public canvas: HTMLCanvasElement;
	public height;
	public width;
	public texture: { width: number; height: number };
	public config: Phaser.Types.Core.GameConfig;
	public game: Phaser.Game;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.width = 1024;
		this.height = 480;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.texture = {
			width: 32,
			height: 32,
		};
		this.config = {
			type: Phaser.WEBGL,
			width: this.width,
			height: this.height,
			canvas: this.canvas,
			physics: {
				default: "arcade",
				arcade: {
					gravity: { y: 0 },
					fps: 60,
					debug: false,
					debugShowBody: true,
					debugShowStaticBody: true,
					debugShowVelocity: true,
					debugVelocityColor: 0xffff00,
					debugBodyColor: 0x0000ff,
					debugStaticBodyColor: 0xffffff,
				},
			},
			input: {
				queue: true,
			} as Phaser.Types.Core.InputConfig,
			backgroundColor: "#1a1a1a",
			scene: [Scene],
			render: { pixelArt: true, antialias: true },
		};
		this.game = new Phaser.Game(this.config);
	}

	update(data: any) {
		const scene = this.game.scene.scenes[0] as Scene;
		const serverPlayers = Object.keys(data).filter(
			(p: any) => p != "undefined" && p != (window as any).channel.id
		);

		// Remove duplicate players and also remove disconnected
		for (let i = 0; i < scene.players.length; i++) {
			const player = scene.players[i];
			if (!serverPlayers.includes(player.id)) {
				const p = scene.players.splice(i, 1)[0];
				p.destroy();
			}
		}

		// Add new players if found
		const clientPlayers = scene.players.map((player: any) => player.id);

		for (let i = 0; i < serverPlayers.length; i++) {
			if (!clientPlayers.includes(serverPlayers[i])) {
				const player: any = scene.add.sprite(200, 200, "player");
				player.setScale(SCALE);
				player.play("idle");
				player.movement = {
					left: false,
					up: false,
					right: false,
					down: false,
				};
				player.animationState = "idle";
				player.id = serverPlayers[i];
				scene.players.push(player);
			}
		}

		// Update player position
		for (let i = 0; i < scene.players.length; i++) {
			const player = scene.players[i];
			player.x = data[player.id].x;
			player.y = data[player.id].y;
			player.movement = data[player.id].movement;

			const movement = Object.values(player.movement).filter((v) => v).length;
			if (player.movement.left && !player.flipX && !player.movement.right) {
				player.facing = 0;
				player.flipX = true;
			} else if (
				player.movement.right &&
				player.flipX &&
				!player.movement.left
			) {
				player.facing = 1;
				player.flipX = false;
			}

			// Animate player
			if (player.animationState !== "idle" && movement === 0) {
				player.animationState = "idle";
				player.play("idle");
			} else if (player.animationState !== "run" && movement > 0) {
				player.animationState = "run";
				player.play("run");
			}

			// Set depth
			player.setDepth(player.y);
		}
	}

	init() {}
	render() {}
}
