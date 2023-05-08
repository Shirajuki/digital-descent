import * as Phaser from "phaser";

export type PropsType = {
	className?: string;
};
export type ChatPropsType = {
	channel: any;
	wrapperClassName?: string;
	scale?: boolean;
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

export type AreaType =
	| "STARTING"
	| "RESTING"
	| "TREASURE"
	| "CHALLENGE"
	| "BATTLE"
	| "SUBQUEST"
	| "SHOP";

export type SkillTargetType = "all" | "single" | "self";

// Use window object to globally share data between modules and components
declare global {
	interface Window {
		channel: any;
		exploration: any;
		engine: any; // For testing and debugging purposes
		playerBattleClass: string | null;
		playerName: string;
		playerIndex: number;
	}
}
declare module "phaser" {
	interface Game {
		currentScene: string;
		data: any;
	}
}
