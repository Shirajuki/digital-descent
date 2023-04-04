import { SCALE, SPEED } from "../constants";
import {
	AREAS,
	generateAvailableAreas,
} from "../rpg/systems/explorationSystem";
import Scene from "./scene";

export default class ExplorationScene extends Scene {
	public teleportingPads: any[] = [];
	public areas: any;
	public currentArea: any;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}
	preload() {
		this.load.spritesheet("player", "sprites/spritesheet.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.spritesheet("teleportingPad", "sprites/spritesheet.png", {
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

		// Create player
		this.player = this.add.sprite(0, 0, "player");
		this.player.setScale(SCALE);
		this.player.play("idle");
		this.player.movement = {
			left: false,
			up: false,
			right: false,
			down: false,
		};
		this.player.animationState = "idle";
		this.player.onTeleportingPad = false;

		// Create teleporting pad
		const distance = 500;
		this.teleportingPads = [
			this.add.sprite(-distance, 0, "teleportingPad"),
			this.add.sprite(0, -distance, "teleportingPad"),
			this.add.sprite(distance, 0, "teleportingPad"),
			this.add.sprite(0, distance, "teleportingPad"),
		];
		this.teleportingPads.forEach((pad: Phaser.GameObjects.Sprite) => {
			pad.setDepth(-10000);
			pad.setAngle(180);
		});

		// Setup text
		this.text = this.add.text(15, 15, "", {
			fontFamily: "Arial",
			fontSize: "32px",
			color: "#fff",
		});

		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);

		// Keyboard input setup
		this.input.keyboard.on("keydown", (event: any) => {
			if (document?.activeElement?.nodeName === "INPUT") return;
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

		this.game.currentScene = "exploration";
		this.currentArea = AREAS.STARTING.area();
		this.areas = generateAvailableAreas();
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
		this.text.text = `Pos: ${Math.round(this.player.x)},${Math.round(
			this.player.y
		)}`.trim();

		// Check player collision
		for (let i = 0; i < this.teleportingPads.length; i++) {
			const pad = this.teleportingPads[i];
			if (
				this.player.x < pad.x + pad.width + 100 &&
				this.player.x + this.player.width > pad.x - 100 &&
				this.player.y < pad.y + pad.height + 100 &&
				this.player.height + this.player.y > pad.y - 100
			) {
				pad.setScale(12);
				this.player.onTeleportingPad = i;
				break;
			} else {
				pad.setScale(6);
				this.player.onTeleportingPad = -1;
			}
		}

		// Trigger teleporting pad if enough players
		if (this.player.onTeleportingPad > -1) {
			// Get area data
			const area = this.areas[this.player.onTeleportingPad];
			console.log(this.areas, area, this.player.onTeleportingPad);
			// Load area data
		}

		// Multiplayer test
		const channel = (window as any).channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", {
				id: channel.id,
				x: this.player.x,
				y: this.player.y,
				movement: this.player.movement,
				onTeleportingPad: this.player.onTeleportingPad,
			});
		}

		this.game.scene.switch("exploration", "battle");
	}
}
