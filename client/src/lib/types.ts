import * as Phaser from "phaser";
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

// Use window object to globally share data between components
declare global {
	interface Window {
		channel: any;
	}
}
