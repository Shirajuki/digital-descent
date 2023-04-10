import Observable from "../observable";
import { inputInitPlayerMovement } from "../rpg/input";
import { initializePlayer } from "../rpg/player";
import { addPlayers, removeDuplicatePlayers, updatePlayers } from "../rpg/sync";
import {
	AREAS,
	generateAvailableAreas,
} from "../rpg/systems/explorationSystem";
import { AreaType } from "../types";
import Scene from "./scene";

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
	}
	create() {
		super.create();
		inputInitPlayerMovement(this);

		// Setup text
		this.text = this.add.text(15, 15, "", {
			fontFamily: "Arial",
			fontSize: "32px",
			color: "#fff",
		});

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
			...this.players.filter((p) => p.id !== oldPlayer?.id),
			this.player,
		];
		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);

		this.currentArea = AREAS.STARTING.area();
		this.areas = generateAvailableAreas();
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
			updatePlayers(this, data.players);
		}
	}

	update(_time: any, _delta: any) {
		// Update player
		this.player.updatePlayer();

		// Update text
		this.text.text = `Pos: ${Math.round(this.player.x)},${Math.round(
			this.player.y
		)}`.trim();

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
				break;
			} else if (pad.scale !== 1) {
				pad.setScale(1);
			}
		}
		if (standingOnTeleporter > -1) this.player.onTeleportingPad += 1;
		else this.player.onTeleportingPad = -1;

		// Trigger teleporting pad if enough players
		if (this.player.onTeleportingPad >= 150) {
			// Get area data
			const area = this.areas[standingOnTeleporter];
			console.log(this.areas, area, this.player.onTeleportingPad);
			// Load area data
			this.switch("battle");
		}

		// Send player data to server
		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", {
				player: this.player.getData(),
			});
		}

		// this.switch("battle");
	}
}
