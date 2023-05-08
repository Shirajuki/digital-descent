import Observable from "../observable";
import { inputInitPlayerMovement } from "../rpg/input";
import { initializePlayer } from "../rpg/player";
import {
	addPlayers,
	removeDuplicatePlayers,
	reorderPlayers,
	updatePlayers,
} from "../rpg/sync";
import Scene from "./scene";
import collisions from "../collisions/officeCollisions.json";
import { DEBUG } from "../constants";
import { generateTasks } from "../rpg/systems/taskSystem";

export default class OfficeScene extends Scene {
	public text: any;
	public role = {
		display: false,
		ready: false,
	};

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		// Load player sprite
		this.load.spritesheet("player", "sprites/spritesheet.png", {
			frameWidth: 72,
			frameHeight: 72,
		});
		// Load bg sprite
		this.load.spritesheet("officeBg", "sprites/officeBg.png", {
			frameWidth: 1600,
			frameHeight: 1100,
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
		const oldPlayer = this.player;
		this.player = initializePlayer(this, window.playerName ?? "Player");
		this.players = [
			...this.players.filter((p) => p?.id !== oldPlayer?.id),
			this.player,
		];
		if (oldPlayer) {
			oldPlayer?.nameEntity?.destroy();
			oldPlayer?.destroy();
		}
		console.log(this.players);
		// Load bg
		this.add.sprite(0, 0, "officeBg").setDepth(-10000).setScale(0.5);
		// Move player to starting position
		this.player.setPosition(-250, 150);
		this.player.flipX = false;
		// Setup collisions
		const objects = collisions?.layers.find(
			(l) => l.type === "objectgroup" && l.name === "collision"
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

		// Setup event collisions
		const events = collisions?.layers.find(
			(l) => l.type === "objectgroup" && l.name === "events"
		)?.objects;
		if (events) {
			for (let i = 0; i < events.length; i++) {
				const collision = this.add
					.rectangle(
						events[i].x * 0.5,
						events[i].y * 0.5,
						events[i].width * 0.5,
						events[i].height * 0.5,
						0x000000
					)
					.setDepth(10000)
					.setOrigin(0, 0)
					.setStrokeStyle(3, 0x00ff00);
				if (!DEBUG) collision.setAlpha(0);
				collision.isFilled = false;
				collision.name = events[i].name;
				this.eventCollisions.push(collision);
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

		if (this.game.currentScene === "office") {
			setTimeout(() => {
				const channel = window.channel;
				if (channel) {
					channel.emit(
						"dialogue",
						{ scenario: "GAME_INTRO" },
						{ reliable: true }
					);
				}
			}, 500);
		}
	}

	sync(data: any) {
		const serverPlayers = Object.keys(data.players).filter(
			(p: any) => p != "undefined"
		);
		const serverPlayersData = serverPlayers.map((p) => data.players[p]);
		removeDuplicatePlayers(this, serverPlayers);
		addPlayers(this, serverPlayers, serverPlayersData);
		reorderPlayers(this, serverPlayers);
		updatePlayers(this, data.players);
	}

	triggerAction(action: string): void {
		console.log(action);
		if (this.game.currentScene === "office") {
			if (action === "START_ROLE_SELECTION") {
				this.role.display = true;
				this.observable.notify();
			} else if (action === "END_ROLE_SELECTION") {
				this.role.display = false;
				this.observable.notify();
				// Trigger new dialogue for roles
				const channel = window.channel;
				if (channel) {
					channel.emit(
						"dialogue",
						{
							scenario: "ROLES",
						},
						{ reliable: true }
					);
				}
			} else if (action === "TELEPORT_TO_DIGITALWORLD") {
				const channel = window.channel;
				this.switch("digitalworld");

				// Generate new set of tasks
				const tasks = generateTasks(20);
				this.game.data.openTasks = tasks;
				channel?.emit(
					"task-initialize",
					{
						tasks: tasks,
					},
					{ reliable: true }
				);

				// Trigger new dialogue for first time in digital world intro
				setTimeout(() => {
					channel?.emit(
						"dialogue",
						{
							scenario: "DIGITALWORLD_INTRO",
						},
						{ reliable: true }
					);
				}, 1000);
			}
		} else if (this.game.currentScene === "newoffice") {
			if (action === "INITIALIZE_CUSTOMER_BATTLE") {
				this.game.data.returnBackTo = "newoffice";
				if (this.game.data.days % 5 === 0)
					this.game.data.displayDays = this.game.data.days;
				this.game.data.days++;
				this.switch("battle");
			} else if (action === "CUSTOMER_MEETING_WIN") {
				this.switch("digitalworld");
			} else if (action === "CUSTOMER_MEETING_LOSE") {
				this.switch("digitalworld");
			} else if (action === "PROJECT_DELIVERY_WIN") {
				// Game over!
				this.switch("partyoffice");
			} else if (action === "PROJECT_DELIVERY_LOSE") {
				this.switch("digitalworld");
			}
		}
	}
	update(_time: any, _delta: any) {
		// Update player
		this.player.updatePlayer(this.collisions);

		// Event collisions
		let eventCollided = false;
		for (let i = 0; i < this.eventCollisions.length; i++) {
			if (
				this.player.x > this.eventCollisions[i].x &&
				this.player.x <
					this.eventCollisions[i].x + this.eventCollisions[i].width &&
				this.player.y > this.eventCollisions[i].y &&
				this.player.y <
					this.eventCollisions[i].y + this.eventCollisions[i].height
			) {
				if (DEBUG) this.eventCollisions[i].setStrokeStyle(3, 0x00ff00);
				eventCollided = true;
				if (this.player.eventCollision !== this.eventCollisions[i].name) {
					this.player.eventCollision = this.eventCollisions[i].name;
					console.log(this.players);

					// Emit meeting event if all players are in the event collision
					if (
						this.players.filter(
							(p) => p?.eventCollision === this.eventCollisions[i].name
						).length === this.players.length
					) {
						if (this.game.currentScene === "office") {
							setTimeout(() => {
								const channel = window.channel;
								if (channel) {
									channel.emit(
										"dialogue",
										{
											scenario: "CUSTOMER_INTRO",
											forceall: true,
										},
										{ reliable: true }
									);
								}
							}, 1000);
						} else if (this.game.currentScene === "newoffice") {
							setTimeout(() => {
								const channel = window.channel;
								if (channel) {
									channel.emit(
										"dialogue",
										{
											scenario: "CUSTOMER_MEETING",
											forceall: true,
										},
										{ reliable: true }
									);
								}
							}, 1000);
						}
					}
				}
			} else {
				if (DEBUG) {
					this.eventCollisions[i].setStrokeStyle(3, 0x0000ff);
				}
			}
		}
		if (!eventCollided && this.player.eventCollision !== "")
			this.player.eventCollision = "";
		// Send player data to server
		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", { player: this.player.getData() });
		}
	}
}
