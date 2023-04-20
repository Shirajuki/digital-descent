import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import * as Phaser from "phaser";
import DigitalWorldScene from "./scenes/digitalworld";
import { clearFocus } from "./utils";
import ExplorationScene from "./scenes/exploration";
import BattleScene from "./scenes/battle";
import Observable from "./observable";
import OfficeScene from "./scenes/office";

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
					debug: false,
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
				new OfficeScene({ key: "office" }, this.observable),
			],
			render: { pixelArt: true, antialias: true },
		};
		this.game = new Phaser.Game(this.config);
		this.game.currentScene = "digitalworld";
	}

	init() {
		this.canvas.addEventListener("mousedown", () => {
			clearFocus();
		});
	}

	render() {}
}
