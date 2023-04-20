import Observable from "../observable";
import { inputInitPlayerMovement } from "../rpg/input";
import { initializePlayer } from "../rpg/player";
import { addPlayers, removeDuplicatePlayers, updatePlayers } from "../rpg/sync";
import Scene from "./scene";
import collisions from "../collisions/digitalWorldCollisions.json";
import { DEBUG } from "../constants";

export default class DigitalWorldScene extends Scene {
	public text: any;

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		// Load bg sprite
		this.load.spritesheet("digitalWorldBg", "sprites/digitalWorldBg.png", {
			frameWidth: 3500,
			frameHeight: 2400,
		});
		// Load overlay sprites
		this.load.spritesheet("tree", "sprites/tree.png", {
			frameWidth: 750,
			frameHeight: 750,
		});
		this.load.spritesheet("rock1", "sprites/rock1.png", {
			frameWidth: 200,
			frameHeight: 200,
		});
		this.load.spritesheet("rock2", "sprites/rock2.png", {
			frameWidth: 200,
			frameHeight: 250,
		});
		this.load.spritesheet(
			"digitalWorldOverlay",
			"sprites/digitalWorldOverlay.png",
			{
				frameWidth: 3500,
				frameHeight: 2400,
			}
		);
		// Load player sprite
		this.load.spritesheet("player", "sprites/spritesheet.png", {
			frameWidth: 72,
			frameHeight: 72,
		});
		// Load player customization / accessories
		// TODO: add head accessories
		// TODO: add other accessories
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
		const oldPlayer = this.player;
		this.player = initializePlayer(this, "Player 1");
		this.players = [
			...this.players.filter((p) => p.id !== oldPlayer.id),
			this.player,
		];

		// Load bg
		this.add.sprite(0, 0, "digitalWorldBg").setDepth(-10000).setScale(0.5);
		this.add
			.sprite(0, 0, "digitalWorldOverlay")
			.setDepth(10000)
			.setScale(0.5)
			.setAlpha(0.9);
		this.add.sprite(-27, 59, "tree").setDepth(140).setScale(0.5).setAlpha(0.9);
		this.add
			.sprite(-247, -118, "rock1")
			.setDepth(-115)
			.setScale(0.5)
			.setAlpha(0.9);
		this.add
			.sprite(65, -130, "rock2")
			.setDepth(-125)
			.setScale(0.5)
			.setAlpha(0.9);
		// Move player to starting position
		this.player.setPosition(-600, 300);
		this.player.flipX = false;
		// Setup collisions
		const objects = collisions?.layers.find(
			(l) => l.type === "objectgroup"
		)?.objects;
		if (objects) {
			for (let i = 0; i < objects.length; i++) {
				const collision = this.add
					.rectangle(
						objects[i].x * 0.5,
						objects[i].y * 0.5,
						objects[i].width * 0.5,
						objects[i].height * 0.5,
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

		inputInitPlayerMovement(this);

		this.preloaded = true;
		this.initialize();
	}

	initialize(): void {
		if (!this.preloaded) return;
		super.initialize();
	}

	sync(data: any) {
		const serverPlayers = Object.keys(data.players).filter(
			(p: any) => p != "undefined"
		);
		const serverPlayersData = serverPlayers.map((p) => data[p]);
		removeDuplicatePlayers(this, serverPlayers);
		addPlayers(this, serverPlayers, serverPlayersData);
		updatePlayers(this, data);
	}

	update(_time: any, _delta: any) {
		// Update player
		this.player.updatePlayer(this.collisions);

		// Send player data to server
		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", { player: this.player.getData() });
		}

		// this.switch("exploration");
		// this.switch("office");
	}
}
