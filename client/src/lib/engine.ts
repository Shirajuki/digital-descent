import { CANVAS_HEIGHT, CANVAS_WIDTH, SCALE } from "./constants";
import * as Phaser from "phaser";
import DigitalWorldScene from "./scenes/digitalworld";
import Scene from "./scenes/scene";
import { clearFocus } from "./utils";
import ExplorationScene from "./scenes/exploration";
import BattleScene from "./scenes/battle";
import Observable from "./observable";

export default class PhaserEngine {
	public canvas: HTMLCanvasElement;
	public height;
	public width;
	public texture: { width: number; height: number };
	public config: Phaser.Types.Core.GameConfig;
	public game: Phaser.Game;
	public observable = new Observable();

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.width = CANVAS_WIDTH;
		this.height = CANVAS_HEIGHT;
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
					debug: true,
				},
			},
			input: {
				queue: true,
			} as Phaser.Types.Core.InputConfig,
			backgroundColor: "#1a1a1a",
			scene: [
				new DigitalWorldScene({ key: "digitalworld" }, this.observable),
				new ExplorationScene({ key: "exploration" }, this.observable),
				new BattleScene({ key: "battle" }, this.observable),
			],
			render: { pixelArt: true, antialias: true },
		};
		this.game = new Phaser.Game(this.config);
		this.game.currentScene = "digitalworld";
	}

	update(data: any) {
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

	init() {
		window.engine = this;
		this.canvas.addEventListener("mousedown", () => {
			clearFocus();
		});
	}

	render() {}
}
