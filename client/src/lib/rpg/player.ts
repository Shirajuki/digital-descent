import { ELEMENT, SCALE, SPEED } from "../constants";
import { getSkills } from "./class";

export const initializePlayer = (
	scene: any,
	name: string,
	oldPlayer: any = null
) => {
	const player = scene.add.sprite(0, 0, "player");
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
	player.battleClass = "dps";
	player.skills = getSkills(player);

	// Exploration
	player.onTeleportingPad = { standingTime: 0, teleporter: 0 };

	// Battle
	player.stats = {
		HP: 100,
		SP: 100,
		ATK: 20,
		DEF: 10,
		SPEED: 10,
		ELEMENT: ELEMENT.LIGHT,
		LEVEL: 1,
	};
	player.battleStats = {
		HP: 100,
		SP: 100,
		CHARGE: 0,
		MAXCHARGE: 5,
	};
	player.name = name;

	if (oldPlayer) {
		player.stats = oldPlayer.stats;
		player.battleStats = oldPlayer.battleStats;
		oldPlayer.destroy();
	}

	player.getData = function () {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			animationState: this.animationState,
			movement: this.movement,
			stats: this.stats,
			battleStats: this.battleStats,
			onTeleportingPad: this.onTeleportingPad,
		};
	};
	player.updatePlayerAnimation = function () {
		const movement = Object.values(player.movement).filter((v) => v).length;
		if (this.movement.left && !this.flipX && !this.movement.right) {
			this.facing = 0;
			this.flipX = true;
		} else if (this.movement.right && this.flipX && !this.movement.left) {
			this.facing = 1;
			this.flipX = false;
		}

		// Animate player
		if (this.animationState !== "idle" && movement === 0) {
			this.animationState = "idle";
			this.play("idle");
		} else if (this.animationState !== "run" && movement > 0) {
			this.animationState = "run";
			this.play("run");
		}
	};
	player.updatePlayer = function () {
		let speed = SPEED;
		const movement = Object.values(this.movement).filter((v) => v).length;
		if (movement > 1) speed *= 0.71;
		if (this.movement.left) this.x -= speed;
		if (this.movement.up) this.y -= speed;
		if (this.movement.right) this.x += speed;
		if (this.movement.down) this.y += speed;
		this.updatePlayerAnimation();

		this.setDepth(this.y);
	};
	const channel = window.channel;
	if (channel) player.id = channel.id;
	return player;
};
