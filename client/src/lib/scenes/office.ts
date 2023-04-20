import Observable from "../observable";
import { inputInitPlayerMovement } from "../rpg/input";
import { initializePlayer } from "../rpg/player";
import { addPlayers, removeDuplicatePlayers, updatePlayers } from "../rpg/sync";
import Scene from "./scene";

export default class OfficeScene extends Scene {
	public text: any;

	constructor(
		config: string | Phaser.Types.Scenes.SettingsConfig,
		observable: Observable
	) {
		super(config, observable);
	}
	preload() {
		// Load player sprite
		this.load.spritesheet("explorationBg", "sprites/explorationBg.png", {
			frameWidth: 2400,
			frameHeight: 1600,
		});
	}
	create() {
		super.create();

		// Create player
		const oldPlayer = this.player;
		this.player = initializePlayer(this, "Player 1");
		this.players = [
			...this.players.filter((p) => p.id !== oldPlayer.id),
			this.player,
		];

		// Setup camera to follow player
		this.cameras.main.startFollow(this.player, true, 0.03, 0.03);

		inputInitPlayerMovement(this);

		this.preloaded = true;
		this.initialize();
	}

	initialize(): void {
		if (!this.preloaded) return;
		super.initialize();
	}

	sync(data: any) {
		const serverPlayers = Object.keys(data.players).filter(
			(p: any) => p != "undefined"
		);
		const serverPlayersData = serverPlayers.map((p) => data[p]);
		removeDuplicatePlayers(this, serverPlayers);
		addPlayers(this, serverPlayers, serverPlayersData);
		updatePlayers(this, data);
	}

	update(_time: any, _delta: any) {
		// Update player
		this.player.updatePlayer();

		// Send player data to server
		const channel = window.channel;
		if (channel) {
			if (!this.player.id) this.player.id = channel.id;
			channel.emit("game-update", { player: this.player.getData() });
		}
	}
}
