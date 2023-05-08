import * as Phaser from "phaser";
import Observable from "../observable";

type DialogueType = {
	texts: any[];
	ended: string[];
	display: boolean;
	scenario: string;
	action: string;
};
export default class Scene extends Phaser.Scene {
	public players: any[] = [];
	public player: any;
	public key: string;
	public observable: Observable;
	public preloaded: boolean = false;
	public collisions: any[] = [];
	public eventCollisions: any[] = [];
	public dialogue: DialogueType = {
		texts: [],
		ended: [],
		display: false,
		scenario: "",
		action: "",
	};
	public days = {
		display: false,
		ready: false,
	};

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config);
		this.key = (config as any).key ? (config as any).key : config;
		this.observable = observable;
		console.log("LOAD SCENE " + this);
	}
	toString() {
		return this.key;
	}
	create() {
		console.log("CREATE SCENE " + this);
		this.physics.world.setFPS(60);
	}
	initialize() {
		console.log("INIT SCENE " + this);
	}
	destroy() {
		console.log("DESTROY SCENE " + this);
		this.children.removeAll();
	}
	dialogueSync() {
		if (this.dialogue.texts.length > 0) {
			this.dialogue.display = true;
		}
		this.observable.notify();
	}
	triggerAction(action: string) {}
	togglePopup(data: any) {}
	sync(data: any) {}
	switch(scene: string) {
		console.log(this.game.currentScene, "->", scene);
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
