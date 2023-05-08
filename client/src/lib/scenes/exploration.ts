import Observable from "../observable";
import { inputInitPlayerMovement } from "../rpg/input";
import { initializePlayer } from "../rpg/player";
import {
	addPlayers,
	removeDuplicatePlayers,
	reorderPlayers,
	updatePlayers,
} from "../rpg/sync";
import {
	AREAS,
	generateAvailableAreas,
} from "../rpg/systems/explorationSystem";
import { AreaType } from "../types";
import Scene from "./scene";
import collisions from "../collisions/explorationCollisions.json";
import { DEBUG } from "../constants";

export default class ExplorationScene extends Scene {
	public teleportingPads: any[] = [];
	public text: any;
	public displays: any[] = [];
	public areas: any;
	public currentArea: any;
	public areaTypeMapping = {
		STARTING: "restDisplay",
		RESTING: "restDisplay",
		TREASURE: "treasureDisplay",
		CHALLENGE: "towerOfTrialsDisplay",
		BATTLE: "battleDisplay",
		SUBQUEST: "subquestDisplay",
		SHOP: "shopDisplay",
	};

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		// Teleporting pad
		this.load.spritesheet("teleportingPad", "sprites/teleportingPad.png", {
			frameWidth: 400,
			frameHeight: 200,
		});

		// Teleporting pad displays
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
		this.load.spritesheet("explorationBg", "sprites/explorationBg.png", {
			frameWidth: 2400,
			frameHeight: 1600,
		});
		this.load.spritesheet("signPost", "sprites/signPost.png", {
			frameWidth: 200,
			frameHeight: 250,
		});
	}
	create() {
		super.create();
		inputInitPlayerMovement(this);

		this.preloaded = true;
		this.initialize();
	}

	generateDisplays() {
		// Generate images for each area
		for (let i = 0; i < this.displays.length; i++) {
			this.displays[i].destroy();
		}
		this.displays.length = 0;
		for (let i = 0; i < this.teleportingPads.length; i++) {
			const type: AreaType = this.areas[i].type;
			const teleportingPad = this.teleportingPads[i];
			const display = this.add.sprite(
				teleportingPad.x,
				teleportingPad.y - 180,
				this.areaTypeMapping[type]
			);
			display.setScale(0.5);
			this.displays.push(display);
		}
	}

	initialize(): void {
		if (!this.preloaded) return;
		super.initialize();
		// Create player
		const oldPlayer = this.player;
		this.player = initializePlayer(this, "Player 1", oldPlayer);
		this.players = [
			...this.players.filter((p) => p?.id !== oldPlayer?.id),
			this.player,
		];
		// Create background
		this.add.sprite(0, 0, "explorationBg").setDepth(-10000);
		this.add.sprite(150, -110, "signPost").setDepth(-110 + 62);
		// Set player to starting position
		this.player.setPosition(0, 0);
		this.player.flipX = false;
		// Setup collisions
		const objects = collisions?.layers.find(
			(l) => l.type === "objectgroup" && l.name === "collision"
		)?.objects;
		if (objects) {
			for (let i = 0; i < objects.length; i++) {
				const collision = this.add
					.rectangle(
						objects[i].x,
						objects[i].y,
						objects[i].width,
						objects[i].height,
						0x000000
					)
					.setDepth(10000)
					.setOrigin(0, 0)
					.setStrokeStyle(3, 0xff0000);
				if (!DEBUG) collision.setAlpha(0);
				collision.isFilled = false;
				this.collisions.push(collision);
			}
		}

		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);

		this.currentArea = AREAS.STARTING.area();
		this.areas = generateAvailableAreas();

		// Create teleporting pad
		const distance = 800;
		this.teleportingPads = [
			this.add.sprite(-distance, 0, "teleportingPad"),
			this.add.sprite(0, -distance + 200, "teleportingPad"),
			this.add.sprite(distance, 0, "teleportingPad"),
			this.add.sprite(0, distance - 200, "teleportingPad"),
		];
		this.teleportingPads.forEach((pad: Phaser.GameObjects.Sprite) => {
			pad.setDepth(-10000);
		});
		this.generateDisplays();

		// Initialize exploration
		setTimeout(() => {
			const channel = window.channel;
			if (channel) {
				if (!this.player.id) this.player.id = channel.id;
				channel.emit("exploration-initialize", {
					exploration: { steps: 0, danger: 0, areas: this.areas },
				});
			}
		}, 1000);

		// Check steps
		this.checkSteps();
		this.game.data.returnBackTo = "exploration";
	}

	sync(data: any) {
		if (data.type === "exploration-initialize") {
			this.areas = data.exploration.areas;
			this.generateDisplays();
		} else if (data.type === "game-update") {
			const serverPlayers = Object.keys(data.players).filter(
				(p: any) => p != "undefined"
			);
			const serverPlayersData = serverPlayers.map((p) => data.players[p]);
			removeDuplicatePlayers(this, serverPlayers);
			addPlayers(this, serverPlayers, serverPlayersData);
			reorderPlayers(this, serverPlayers);
			updatePlayers(this, data.players);
		}
	}

	triggerAction(action: string): void {
		console.log(action);
		if (action === "TELEPORT_TO_DIGITALWORLD") {
			this.switch("digitalworld");
		}
	}

	checkSteps() {
		if (this.game.data.steps > 6) {
			this.game.data.steps = 0;
			if (this.game.data.days % 5 === 0) {
				this.game.data.displayDays = this.game.data.days;
			}
			this.game.data.days += 1;
			const channel = window.channel;
			if (channel)
				channel.emit("dialogue", {
					scenario: "EXPLORATION_END",
				});
		}
	}

	update(_time: any, _delta: any) {
		// Update player
		this.player.updatePlayer(this.collisions);

		// Check player collision
		let standingOnTeleporter = -1;
		for (let i = 0; i < this.teleportingPads.length; i++) {
			const pad = this.teleportingPads[i];
			if (
				this.player.x < pad.x + 200 &&
				this.player.x > pad.x - 200 &&
				this.player.y < pad.y + 100 &&
				this.player.y > pad.y - 100
			) {
				pad.setScale(1.1);
				standingOnTeleporter = i;
				this.player.onTeleportingPad.teleporter = standingOnTeleporter;
				break;
			} else if (pad.scale !== 1) {
				pad.setScale(1);
			}
		}
		if (standingOnTeleporter > -1)
			this.player.onTeleportingPad.standingTime += 1;
		else this.player.onTeleportingPad.standingTime = 0;

		// Trigger teleporting pad if enough players
		if (
			this.players.every(
				(player) => player.onTeleportingPad.standingTime >= 150
			)
		) {
			// Get area data
			const area = this.areas[this.player.onTeleportingPad.teleporter];
			console.log(this.areas, area, this.player.onTeleportingPad);
			// Load area data
			this.switch("battle");
			this.game.data.steps++;
		}

		// Send player data to server
		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", {
				player: this.player.getData(),
			});
		}
	}
}
