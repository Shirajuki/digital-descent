import { ELEMENT, SCALE, SPEED } from "../constants";
import { getSkills } from "./class";

export const initializePlayer = (
	scene: any,
	name: string,
	oldPlayer: any = null
) => {
	const player = scene.add.sprite(0, 0, "player");
	const playerName = scene.add.text(0, 0, window.playerName || name, {
		fontFamily: "DynaPuff",
		fontSize: "16px",
		color: "#ffffff",
		stroke: "#000000",
		strokeThickness: 4,
	}) as any;
	playerName.setScale(1);
	playerName.setAlpha(1);
	playerName.setDepth(1000);
	playerName.setOrigin(0.5, 0.5);
	player.nameEntity = playerName;
	const shadow = scene.add.ellipse(0, 0, 60, 25, 0x000);
	shadow.setStrokeStyle(7, 0x000);
	shadow.setOrigin(0.5, 0.5);
	shadow.setAlpha(0);
	player.shadow = shadow;

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
	player.battleClass =
		window.playerBattleClass ??
		["tank", "dps", "healer"][Math.floor(Math.random() * 3)];
	// player.battleClass = "healer"; // TEST
	player.skills = getSkills(player);

	player.inventory = [];
	player.equipment = {
		weapon: null,
		armor: null,
		accessory: null,
	};

	// Event collisions
	player.eventCollision = "";

	// Exploration
	player.onTeleportingPad = { standingTime: 0, teleporter: 0 };

	// Battle
	player.stats = {
		HP: 100,
		SP: 100,
		ATK: 20,
		DEF: 10,
		LUCK: 10,
		SPEED: 10,
		ELEMENT: ELEMENT.LIGHT,
		LEVEL: 1,
		EXP: 0,
	};
	player.battleStats = {
		HP: 100,
		SP: 100,
		CHARGE: 0,
		MAXCHARGE: 5,
		dead: false,
	};
	player.effects = [];
	player.name = window.playerName || name;

	// Old player from same scene
	if (oldPlayer) {
		player.stats = oldPlayer.stats;
		player.battleStats = oldPlayer.battleStats;
		player.inventory = oldPlayer.inventory;
		player.equipment = oldPlayer.equipment;
	}
	// Old player from saved data in window object
	if (window.oldPlayer) {
		player.stats = window.oldPlayer.stats;
		player.battleStats = window.oldPlayer.battleStats;
		player.inventory = window.oldPlayer.inventory;
		player.equipment = window.oldPlayer.equipment;
		window.oldPlayer.destroy();
		window.oldPlayer?.nameEntity?.destroy();
		window.oldPlayer = undefined;
	}
	if (oldPlayer) {
		oldPlayer.destroy();
		oldPlayer?.nameEntity?.destroy();
	}

	player.getData = function () {
		return {
			id: this.id,
			name: this.name,
			x: this.x,
			y: this.y,
			animationState: this.animationState,
			movement: this.movement,
			stats: this.stats,
			battleStats: this.battleStats,
			battleClass: this.battleClass,
			onTeleportingPad: this.onTeleportingPad,
			eventCollision: this.eventCollision,
			effects: this.effects,
			inventory: this.inventory,
			equipment: this.equipment,
			shadowAlpha: this.shadow.alpha,
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
	player.updatePlayer = function (collisions: any[] = []) {
		let speed = SPEED;
		const movement = Object.values(this.movement).filter((v) => v).length;
		if (movement > 1) speed *= 0.71;

		// Move and check collisions
		const collision = [true, true, true, true];
		for (let i = 0; i < collisions.length; i++) {
			if (
				this.x + speed > collisions[i].x &&
				this.x + speed < collisions[i].x + collisions[i].width &&
				this.y > collisions[i].y &&
				this.y < collisions[i].y + collisions[i].height
			)
				collision[0] = false;
			if (
				this.x - speed > collisions[i].x &&
				this.x - speed < collisions[i].x + collisions[i].width &&
				this.y > collisions[i].y &&
				this.y < collisions[i].y + collisions[i].height
			)
				collision[1] = false;
			if (
				this.x > collisions[i].x &&
				this.x < collisions[i].x + collisions[i].width &&
				this.y + speed > collisions[i].y &&
				this.y + speed < collisions[i].y + collisions[i].height
			)
				collision[2] = false;
			if (
				this.x > collisions[i].x &&
				this.x < collisions[i].x + collisions[i].width &&
				this.y - speed > collisions[i].y &&
				this.y - speed < collisions[i].y + collisions[i].height
			)
				collision[3] = false;
		}
		if (this.movement.left && collision[1]) this.x -= speed;
		if (this.movement.up && collision[3]) this.y -= speed;
		if (this.movement.right && collision[0]) this.x += speed;
		if (this.movement.down && collision[2]) this.y += speed;

		this.updatePlayerAnimation();

		this.setDepth(this.y);
		this.nameEntity.x = this.x;
		this.nameEntity.y = this.y - 40;
		this.nameEntity.setDepth(this.y + 20000);
		this.shadow.x = this.x;
		this.shadow.y = this.y + 35;
		this.shadow.setDepth(this.y - 1);
	};
	const channel = window.channel;
	if (channel) player.id = channel.id;
	return player;
};
