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
import { shuffle } from "../utils";

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
	public teleported = false;
	public quiz = {
		display: false,
		ready: false,
		answers: ["a", "b", "c", "d"],
		question: "test",
		rewards: 100,
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

		// Monument displays
		this.load.spritesheet(
			"monumentBattle",
			"sprites/monument/monumentBattle.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"monumentResting1",
			"sprites/monument/monumentResting1.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"monumentResting2",
			"sprites/monument/monumentResting2.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"monumentResting3",
			"sprites/monument/monumentResting3.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"monumentTreasure",
			"sprites/monument/monumentTreasure.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"monumentChallenge",
			"sprites/monument/monumentChallenge.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);

		// Teleporting pad displays
		this.load.spritesheet(
			"towerOfTrialsDisplay",
			"sprites/display/towerOfTrialsDisplay.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"battleDisplay",
			"sprites/display/battleDisplay.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet(
			"subquestDisplay",
			"sprites/display/subquestDisplay.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet("shopDisplay", "sprites/display/shopDisplay.png", {
			frameWidth: 400,
			frameHeight: 400,
		});
		this.load.spritesheet(
			"treasureDisplay",
			"sprites/display/treasureDisplay.png",
			{
				frameWidth: 400,
				frameHeight: 400,
			}
		);
		this.load.spritesheet("restDisplay", "sprites/display/restDisplay.png", {
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
		if (window.sfx.battleBackground.volume() === 0.1) {
			window.sfx.background.fade(0, 0.1, 2000);
			window.sfx.battleBackground.fade(0.1, 0, 2000);
		}

		// Create player
		const oldPlayer = this.player;
		this.player = initializePlayer(this, "Player 1", oldPlayer);
		this.players = [
			...this.players.filter((p) => p?.id !== oldPlayer?.id),
			this.player,
		];
		// Create background
		this.add.sprite(0, 0, "explorationBg").setDepth(-10000);
		this.add
			.sprite(150, -110, "signPost")
			.setDepth(-110 + 62)
			.setAlpha(0.9);
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
		this.teleported = false;

		// Check steps
		setTimeout(() => this.checkSteps(), 1000);
		this.game.data.returnBackTo = "exploration";

		// Delete old monuments if any
		this.children.list.forEach((child) => {
			if (child.name === "monument") child.destroy();
		});
		// Draw monuments depending on exploration type
		if (this.game.data.exploration.type === "BATTLE") {
			const monument = this.add
				.sprite(-290, -190, "monumentBattle")
				.setDepth(-150)
				.setScale(0.6)
				.setAlpha(0.9);
			monument.name = "monument";
		} else if (this.game.data.exploration.type === "RESTING") {
			const monument1 = this.add
				.sprite(-250, -150, "monumentResting1")
				.setDepth(-170)
				.setScale(0.8)
				.setAlpha(0.9);
			const monument2 = this.add
				.sprite(-250, -150, "monumentResting2")
				.setDepth(-140)
				.setScale(0.8)
				.setAlpha(0.9);
			const monument3 = this.add
				.sprite(-250, -150, "monumentResting3")
				.setDepth(-130)
				.setScale(0.8)
				.setAlpha(0.9);
			monument1.name = "monument";
			monument2.name = "monument";
			monument3.name = "monument";
		} else if (this.game.data.exploration.type === "TREASURE") {
			const monument = this.add
				.sprite(-290, -190, "monumentTreasure")
				.setDepth(-190)
				.setScale(0.5)
				.setAlpha(0.9);
			monument.name = "monument";
		} else if (this.game.data.exploration.type === "CHALLENGE") {
			const monument = this.add
				.sprite(-270, -170, "monumentChallenge")
				.setDepth(-155)
				.setScale(0.4)
				.setAlpha(0.9);
			monument.name = "monument";
		}

		// First time exploration intro
		if (this.game.currentScene === "exploration") {
			setTimeout(() => {
				const channel = window.channel;
				if (channel) {
					channel.emit("dialogue", { scenario: "EXPLORATION_INTRO" });
				}
			}, 500);
		}
	}

	sync(data: any) {
		if (data.type === "quiz-fix") {
			this.quiz.display = false;
			window.sfx.quizWrong.play();
		} else if (data.type === "quiz-initialize") {
			console.log(111, data);
			const quiz = data.quiz;
			console.log(quiz);
			this.quiz = {
				display: true,
				ready: false,
				answers: quiz.choices,
				question: quiz.question,
				rewards: 100,
			};
			this.observable.notify();
			setTimeout(() => {
				this.observable.notify();
			}, 1000);
		} else if (data.type === "exploration-initialize") {
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
			window.oldPlayer = this.player;
			this.switch("digitalworld");
		}
	}

	checkSteps() {
		if (this.quiz.display === true) return;

		if (this.game.data.steps >= this.game.data.maxSteps) {
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
		super.update(_time, _delta);
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
		const channel = window.channel;
		if (
			this.players.every(
				(player) => player.onTeleportingPad.standingTime >= 150
			) &&
			!this.teleported
		) {
			// Get area data
			const area = this.areas[this.player.onTeleportingPad.teleporter];
			console.log(this.areas, area, this.player.onTeleportingPad);
			console.log(this.players.map((p) => p.onTeleportingPad.standingTime));
			this.teleported = true;
			// Load area data
			setTimeout(() => {
				this.game.data.exploration.type = area.type;
				// Generate new ares
				this.areas = generateAvailableAreas();
				if (area.type === "BATTLE") {
					this.game.data.battleType = "exploration";
					this.switch("battle");
				} else if (area.type === "RESTING") {
					if (this.player)
						this.player.battleStats.HP = Math.min(
							this.player.battleStats.HP + 20,
							this.player.stats.HP
						);
					this.switch("exploration");
					channel.emit("exploration-force-initialize", {
						exploration: {
							steps: 0,
							danger: 0,
							areas: this.areas,
							type: "RESTING",
						},
					});
				} else if (area.type === "TREASURE") {
					// TODO: Treasure
					this.switch("exploration");
					channel.emit("exploration-force-initialize", {
						exploration: {
							steps: 0,
							danger: 0,
							areas: this.areas,
							type: "TREASURE",
						},
					});
				} else if (area.type === "CHALLENGE") {
					channel.emit("quiz-initialize");
					this.switch("exploration");
					channel.emit("exploration-force-initialize", {
						exploration: {
							steps: 0,
							danger: 0,
							areas: this.areas,
							type: "CHALLENGE",
						},
					});
				}
				this.game.data.steps++;
			}, 500);
		}

		// Send player data to server
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", {
				player: this.player.getData(),
			});
		}
	}
}
