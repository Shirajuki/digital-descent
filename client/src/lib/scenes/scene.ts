import * as Phaser from "phaser";
import Observable from "../observable";

export default class Scene extends Phaser.Scene {
	public players: any[] = [];
	public player: any;
	public text: any;
	public key: string;
	public observable: Observable;

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config);
		this.key = (config as any).key ? (config as any).key : config;
		this.observable = observable;
		console.log("LOAD SCENE", config);
	}
	create() {
		console.log("CREATE SCENE", this);
	}
	initialize() {
		console.log("INIT SCENE", this);
	}
	destroy() {
		console.log("DESTROY SCENE", this);
		this.children.removeAll();
	}
	switch(scene: string) {
		console.log(this.game.currentScene);
		// Cleanup scene
		(this.game.scene.getScene(this.game.currentScene) as Scene).destroy();

		// Switch scene
		this.game.scene.switch(this.game.currentScene, scene);
		this.game.currentScene = scene;

		// Initialize scene
		(this.game.scene.getScene(this.game.currentScene) as Scene).initialize();

		// Notify observables
		this.observable.notify();
	}
}
