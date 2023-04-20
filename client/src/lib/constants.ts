// Phaser Engine
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 480;
export const SPEED = 3;
export const SCALE = 1;
export const DEBUG = true;

// RPG
// https://static.wikia.nocookie.net/mstrike/images/1/13/Ms_us_guide06_img02.jpg/revision/latest?cb=20160324022429
export enum ELEMENT {
	FIRE,
	WOOD,
	WATER,
	LIGHT,
	DARK,
}
export const ELEMENT_EFFECTIVENESS_TABLE = [
	[1, 2, 0.5, 1, 1], // ELEMENT.FIRE  0
	[0.5, 1, 2, 1, 1], // ELEMENT.WOOD  1
	[2, 0.5, 1, 1, 1], // ELEMENT.WATER 2
	[1, 1, 1, 1, 2], // ELEMENT.LIGHT 3
	[1, 1, 1, 2, 1], // ELEMENT.DARK  4
];
export const NEGATIVE_STATUS = ["lag", "nervous", "memoryLeak", "burn"];
