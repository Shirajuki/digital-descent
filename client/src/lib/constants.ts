// Phaser Engine
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 480;
export const SPEED = 3;
export const SCALE = 1;
export const DEBUG = !true;

export const NAMES = [
	"Alice",
	"Bob",
	"Charlie",
	"Delta",
	"Echo",
	"Foxtrot",
	"Golf",
	"Hotel",
];

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

export const CURSOR_COLORS = [
	"!border-pink-400",
	"!border-violet-400",
	"!border-emerald-400",
	"!border-red-400",
	"!border-amber-400",
	"!border-green-400",
	"!border-blue-400",
];
export const PLAYER_COLORS = [
	"!bg-pink-400",
	"!bg-violet-400",
	"!bg-emerald-400",
	"!bg-red-400",
	"!bg-amber-400",
	"!bg-green-400",
	"!bg-blue-400",
];
export const POPUPS = [
	"Did you know that one of the core principles of agile software development is to prioritize customer satisfaction through continuous delivery?",
	"By breaking down work into smaller, manageable pieces and delivering working software frequently, you can ensure that the customer is always involved in the development process and that their needs are being met.",
	"Remember to regularly review and adapt your processes to continuously improve the quality and efficiency of your work.",
	"Agile Manifesto is a set of guiding values and principles for agile software development. One of the four values in the manifesto is responding to change over following a plan.",
	"Agile Manifesto is a set of guiding values and principles for agile software development. One of the four values in the manifesto is customer collaboration over contract negotiation.",
	"Tools like taskboards can support agile practices, but it's up to the team to truly embody the agile mindset and principles for success.",
	"Did you know that iterative development and incremental design are essential parts of Agile methodology?",
	"Continuously improve: Keep an open mind to change and improvement, and constantly look for ways to enhance your Agile approach.",
	"Agile is not just a methodology, it’s a mindset. Remember, Agile is not a one-time implementation, it’s a journey towards excellence.",
];
