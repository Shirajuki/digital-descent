import Phaser from "phaser";
export type Player = {
	sprite: Phaser.GameObjects.Sprite;
	movement: {
		left: boolean;
		up: boolean;
		right: boolean;
		down: boolean;
	};
	animationState: string;
};
