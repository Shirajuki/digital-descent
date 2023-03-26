import * as Phaser from "phaser";

export type PropsType = {
	className?: string;
};
export type ChatPropsType = {
	channel: any;
} & PropsType;

export type PlayerType = {
	sprite: Phaser.GameObjects.Sprite;
	movement: {
		left: boolean;
		up: boolean;
		right: boolean;
		down: boolean;
	};
	animationState: string;
};

export type ChatType = {
	sender: string;
	message: string;
};

// Use window object to globally share data between modules and components
declare global {
	interface Window {
		channel: any;
		exploration: any;
	}
}
