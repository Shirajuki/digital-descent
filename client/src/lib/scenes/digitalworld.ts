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
import collisions from "../collisions/digitalWorldCollisions.json";
import { DEBUG } from "../constants";
import { lerp } from "../utils";

export default class DigitalWorldScene extends Scene {
	public text: any;
	public taskboard = {
		tasks: [
			{
				name: "Task 1",
				description: "Catch 4 bugs",
				complete: false,
			},
			{
				name: "Task 2",
				description: "Defeat 3 enemies",
				complete: false,
			},
			{
				name: "Task 3",
				description: "Complete 2 puzzles",
				complete: false,
			},
		],
		display: false,
		ready: false,
	};
	public portal = {
		display: false,
		ready: false,
	};
	public shop = {
		display: false,
		ready: false,
	};

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	togglePopup(data: any, force: any = null): void {
		if (data === "taskboard") {
			this.taskboard.display = force ? force.force : !this.taskboard.display;
		} else if (data === "portal") {
			this.portal.display = force ? force.force : !this.portal.display;
		} else if (data === "shop") {
			this.shop.display = force ? force.force : !this.shop.display;
		}
		setTimeout(() => {
			this.observable.notify();
		}, 500);
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

		inputInitPlayerMovement(this);

		this.preloaded = true;
		this.initialize();
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

		setTimeout(() => {
			if (this.game.data.days % 5 === 0 && this.game.data.days > 0) {
				// Toggle meeting time!
				window.channel.emit("dialogue", {
					scenario: "MEETING_TIME",
					forceall: true,
				});
			}
			this.observable.notify();
		}, 1000);
		this.game.data.returnBackTo = "digitalworld";
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
		const channel = window.channel;
		if (action === "INITIALIZE_MEETING") {
			this.switch("newoffice");
		} else if (action === "OPEN_TASKBOARD") {
			this.togglePopup("taskboard", { force: true });
			if (channel)
				channel.emit("dialogue", {
					scenario: "TASKBOARD_INTRO",
				});
		} else if (action === "OPEN_PORTAL") {
			this.togglePopup("portal", { force: true });
			if (channel)
				channel.emit("dialogue", {
					scenario: "PORTAL_INTRO",
				});
		} else if (action === "OPEN_SHOP") {
			this.togglePopup("shop", { force: true });
			if (channel)
				channel.emit("dialogue", {
					scenario: "SHOP_INTRO",
				});
		} else if (action === "CLEAR_TASKBOARD_QUEST") {
			this.dialogue.ended.push("TASKBOARD_INTRO");
			this.taskboard.display = false;
			const taskIndex = this.game.data.currentTasks.findIndex(
				(t: any) => t.id === "0"
			);
			this.game.data.currentTasks[taskIndex].progress = 100;
			this.game.data.solvedTasks.push(
				this.game.data.currentTasks.splice(taskIndex, 1)[0]
			);

			if (
				this.dialogue.ended.filter((d) =>
					["TASKBOARD_INTRO", "PORTAL_INTRO", "SHOP_INTRO"].includes(d)
				).length === 3
			) {
				if (channel)
					channel.emit("dialogue", {
						scenario: "BEGIN_GAME",
					});
				this.game.data.days++;
			}
		} else if (action === "CLEAR_PORTAL_QUEST") {
			this.dialogue.ended.push("PORTAL_INTRO");
			this.portal.display = false;
			const taskIndex = this.game.data.currentTasks.findIndex(
				(t: any) => t.id === "2"
			);
			this.game.data.currentTasks[taskIndex].progress = 100;
			this.game.data.solvedTasks.push(
				this.game.data.currentTasks.splice(taskIndex, 1)[0]
			);
			if (
				this.dialogue.ended.filter((d) =>
					["TASKBOARD_INTRO", "PORTAL_INTRO", "SHOP_INTRO"].includes(d)
				).length === 3
			) {
				if (channel)
					channel.emit("dialogue", {
						scenario: "BEGIN_GAME",
					});
				this.game.data.days++;
			}
		} else if (action === "CLEAR_SHOP_QUEST") {
			this.dialogue.ended.push("SHOP_INTRO");
			this.shop.display = false;
			const taskIndex = this.game.data.currentTasks.findIndex(
				(t: any) => t.id === "1"
			);
			this.game.data.currentTasks[taskIndex].progress = 100;
			this.game.data.solvedTasks.push(
				this.game.data.currentTasks.splice(taskIndex, 1)[0]
			);
			if (
				this.dialogue.ended.filter((d) =>
					["TASKBOARD_INTRO", "PORTAL_INTRO", "SHOP_INTRO"].includes(d)
				).length === 3
			) {
				if (channel)
					channel.emit("dialogue", {
						scenario: "BEGIN_GAME",
					});
				this.game.data.days++;
			}
		}
		this.observable.notify();
	}

	update(_time: any, _delta: any) {
		super.update(_time, _delta);
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
				this.player.shadow.setAlpha(lerp(this.player.shadow.alpha, 0.2, 0.1));
				eventCollided = true;
				if (this.player.eventCollision !== this.eventCollisions[i].name) {
					this.player.eventCollision = this.eventCollisions[i].name;

					// Emit meeting event if all players are in the event collision
					if (
						this.players.filter(
							(p) => p.eventCollision === this.eventCollisions[i].name
						).length === this.players.length
					) {
						setTimeout(() => {
							let scenario = "";
							if (this.eventCollisions[i].name === "taskboard")
								scenario = "OPEN_TASKBOARD";
							else if (this.eventCollisions[i].name === "portal")
								scenario = "OPEN_PORTAL";
							else if (this.eventCollisions[i].name === "shop")
								scenario = "OPEN_SHOP";
							const channel = window.channel;
							if (channel) {
								channel.emit("action", {
									scenario: scenario,
									forceall: true,
								});
							}
						}, 1000);
					}
				}
			} else {
				if (DEBUG) {
					this.eventCollisions[i].setStrokeStyle(3, 0x0000ff);
				}
				this.player.shadow.setAlpha(lerp(this.player.shadow.alpha, 0, 0.1));
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
		// this.switch("exploration");
	}
}
