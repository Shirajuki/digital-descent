import * as Phaser from "phaser";

export default class Scene extends Phaser.Scene {
	public players: any[] = [];
	public player: any;
	public text: any;
	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
		console.log("LOAD SCENE", config);
	}
}
