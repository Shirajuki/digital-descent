import { SCALE, SPEED } from "../constants";
import Observable from "../observable";
import { initializePlayer } from "../rpg/player";
import {
	AREAS,
	generateAvailableAreas,
} from "../rpg/systems/explorationSystem";
import Scene from "./scene";

export default class ExplorationScene extends Scene {
	public teleportingPads: any[] = [];
	public displays: any[] = [];
	public areas: any;
	public currentArea: any;

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		this.load.spritesheet("player", "sprites/spritesheet2.png", {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.spritesheet("teleportingPad", "sprites/teleportingPad.png", {
			frameWidth: 400,
			frameHeight: 200,
		});
		// Displays
		this.load.spritesheet(
			"towerOfTrialsDisplay",
			"sprites/towerOfTrialsDisplay.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet("battleDisplay", "sprites/battleDisplay.png", {
			frameWidth: 400,
			frameHeight: 400,
		});
		this.load.spritesheet("subquestDisplay", "sprites/subquestDisplay.png", {
			frameWidth: 400,
			frameHeight: 400,
		});
		this.load.spritesheet("shopDisplay", "sprites/shopDisplay.png", {
			frameWidth: 400,
			frameHeight: 400,
		});
		this.load.spritesheet("treasureDisplay", "sprites/treasureDisplay.png", {
			frameWidth: 400,
			frameHeight: 400,
		});
		this.load.spritesheet("restDisplay", "sprites/restDisplay.png", {
			frameWidth: 400,
			frameHeight: 400,
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

		// Create teleporting pad
		const distance = 600;
		this.teleportingPads = [
			this.add.sprite(-distance, 0, "teleportingPad"),
			this.add.sprite(0, -distance, "teleportingPad"),
			this.add.sprite(distance, 0, "teleportingPad"),
			this.add.sprite(0, distance, "teleportingPad"),
		];
		this.teleportingPads.forEach((pad: Phaser.GameObjects.Sprite) => {
			pad.setDepth(-10000);
		});

		const areaTypeMapping = {
			STARTING: "restDisplay",
			RESTING: "restDisplay",
			TREASURE: "treasureDisplay",
			CHALLENGE: "towerOfTrialsDisplay",
			BATTLE: "battleDisplay",
			SUBQUEST: "subquestDisplay",
			SHOP: "shopDisplay",
		};
		// Generate images for each area
		for (let i = 0; i < this.displays.length; i++) {
			this.displays[i].destroy();
		}
		this.displays.length = 0;
		for (let i = 0; i < this.teleportingPads.length; i++) {
			const type:
				| "STARTING"
				| "RESTING"
				| "TREASURE"
				| "CHALLENGE"
				| "BATTLE"
				| "SUBQUEST"
				| "SHOP" = this.areas[i].type;
			const teleportingPad = this.teleportingPads[i];
			const display = this.add.sprite(
				teleportingPad.x,
				teleportingPad.y - 180,
				areaTypeMapping[type]
			);
			display.setScale(0.5);
			this.displays.push(display);
		}

		// Setup text
		this.text = this.add.text(15, 15, "", {
			fontFamily: "Arial",
			fontSize: "32px",
			color: "#fff",
		});

		this.game.currentScene = "exploration";
	}

	sync(data: any) {
		const scene = this.game.scene.getScene(this.game.currentScene) as Scene;
		const serverPlayers = Object.keys(data).filter(
			(p: any) => p != "undefined"
		);

		// Remove duplicate players and also remove disconnected
		for (let i = 0; i < scene.players.length; i++) {
			const player = scene.players[i];
			if (!serverPlayers.includes(player.id) && scene.player != player.id) {
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
			if (player.id === scene.player.id) continue;
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

	initialize(): void {
		super.initialize();

		// Create player
		const oldPlayer = this.player;
		this.player = initializePlayer(this, "Player 1");
		this.players = [
			...this.players.filter((p) => p.id !== oldPlayer.id),
			this.player,
		];

		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);

		this.currentArea = AREAS.STARTING.area();
		this.areas = generateAvailableAreas();
		const areaTypeMapping = {
			STARTING: "restDisplay",
			RESTING: "restDisplay",
			TREASURE: "treasureDisplay",
			CHALLENGE: "towerOfTrialsDisplay",
			BATTLE: "battleDisplay",
			SUBQUEST: "subquestDisplay",
			SHOP: "shopDisplay",
		};
		// Generate images for each area
		for (let i = 0; i < this.displays.length; i++) {
			this.displays[i].destroy();
		}
		this.displays.length = 0;
		for (let i = 0; i < this.teleportingPads.length; i++) {
			const type:
				| "STARTING"
				| "RESTING"
				| "TREASURE"
				| "CHALLENGE"
				| "BATTLE"
				| "SUBQUEST"
				| "SHOP" = this.areas[i].type;
			const teleportingPad = this.teleportingPads[i];
			const display = this.add.sprite(
				teleportingPad.x * 1,
				teleportingPad.y * 1,
				areaTypeMapping[type]
			);
			this.displays.push(display);
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

		// Update text
		this.text.text = `Pos: ${Math.round(this.player.x)},${Math.round(
			this.player.y
		)}`.trim();

		// Check player collision
		for (let i = 0; i < this.teleportingPads.length; i++) {
			const pad = this.teleportingPads[i];
			if (
				this.player.x < pad.x + 200 &&
				this.player.x > pad.x - 200 &&
				this.player.y < pad.y + 100 &&
				this.player.y > pad.y - 100
			) {
				pad.setScale(1.1);
				this.player.onTeleportingPad = i;
				break;
			} else {
				pad.setScale(1);
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
				stats: this.player.stats,
				battleStats: this.player.battleStats,
				onTeleportingPad: this.player.onTeleportingPad,
			});
		}

		// this.switch("battle");
	}
}
