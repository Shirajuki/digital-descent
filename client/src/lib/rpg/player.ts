import { ELEMENT, SCALE } from "../constants";

export const initializePlayer = (scene: any, name: string) => {
	const player = scene.add.sprite(200, 0, "player");
	// General
	player.setScale(SCALE);
	player.flipX = true;
	player.play("idle");
	player.movement = {
		left: false,
		up: false,
		right: false,
		down: false,
	};
	player.animationState = "idle";

	// Exploration
	player.onTeleportingPad = false;

	// Battle
	player.stats = {
		HP: 100,
		ATK: 20,
		DEF: 10,
		SPEED: 10,
		ELEMENT: ELEMENT.LIGHT,
		LEVEL: 1,
	};
	player.battleStats = {
		HP: 100,
		CHARGE: 0,
		MAXCHARGE: 5,
	};
	player.name = "Player 1";
	return player;
};
