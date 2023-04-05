import * as Phaser from "phaser";
import Observable from "../observable";

export default class Scene extends Phaser.Scene {
	public players: any[] = [];
	public player: any;
	public text: any;
	public observable: Observable;

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config);
		this.observable = observable;
		console.log("LOAD SCENE", config);
	}
	create() {
		console.log("CREATE SCENE", this);
	}
}
