import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import * as Phaser from "phaser";
import DigitalWorldScene from "./scenes/digitalworld";
import { clearFocus } from "./utils";
import ExplorationScene from "./scenes/exploration";
import BattleScene from "./scenes/battle";
import Observable from "./observable";
import OfficeScene from "./scenes/office";
import HomeScene from "./scenes/home";

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
			// transparent: true,
			backgroundColor: "#1a1a1a",
			scene: [
				new HomeScene({ key: "home" }, this.observable),

				new DigitalWorldScene({ key: "digitalworld" }, this.observable),
				new ExplorationScene({ key: "exploration" }, this.observable),
				new BattleScene({ key: "battle" }, this.observable),
				new OfficeScene({ key: "office" }, this.observable),
				new OfficeScene({ key: "newoffice" }, this.observable),
				new OfficeScene({ key: "deliveryoffice" }, this.observable),

				new OfficeScene({ key: "partyoffice" }, this.observable),
			],
			render: { pixelArt: true, antialias: true },
		};
		this.game = new Phaser.Game(this.config);
		this.game.currentScene = "home";
		this.game.data = {
			days: 0,
			displayDays: 0,
			steps: 0,
			maxSteps: 3,
			openTasks: [
				{
					id: "3",
					task: "Test 1",
					rewards: { money: 100, exp: 100 },
					progress: 0,
					done: 0,
					energy: 3,
				},
				{
					id: "4",
					task: "test 2",
					rewards: { money: 100, exp: 100 },
					progress: 0,
					done: 0,
					energy: 2,
				},
			],
			currentTasks: [
				{
					id: "0",
					task: "Visit the task board",
					rewards: { money: 100, exp: 0 },
					progress: 0,
					energy: 0,
					locked: true,
					done: 0,
				},
				{
					id: "1",
					task: "Visit the shop",
					rewards: { money: 100, exp: 0 },
					progress: 0,
					energy: 0,
					locked: true,
					done: 0,
				},
				{
					id: "2",
					task: "Visit the portal",
					rewards: { money: 100, exp: 0 },
					progress: 0,
					energy: 0,
					locked: true,
					done: 0,
				},
			],
			solvedTasks: [],
			exploration: {
				type: "STARTING",
			},
			customerBattle: {
				status: "battling",
				enemy: "customer",
			},
			returnBackTo: "digitalworld",
			money: 0,
		};
		(window as any).gameData = this.game.data;
	}

	init() {
		this.canvas.addEventListener("mousedown", () => {
			clearFocus();
		});
	}

	render() {}
}
