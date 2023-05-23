import { weightedRandom } from "../utils";
import { ELEMENT } from "./../constants";

const bug = () => {
	return {
		name: "Bug",
		type: "monster",
		monsterType: "BUG",
		sprite: "./spritesheet.png",
		stats: {
			HP: Math.ceil(20 + (((window as any).gameData?.days ?? 1) / 5) * 10),
			ATK: 30,
			DEF: 10,
			LUCK: 5,
			SPEED: 5,
			ELEMENT: ELEMENT.WATER,
			LEVEL: 1,
		},
		battleStats: {
			HP: Math.ceil(20 + (((window as any).gameData?.days ?? 1) / 5) * 10),
			dead: false,
		},
		effects: [],
		itemDrop: [],
	};
};

const virus = () => {
	return {
		name: "Virus",
		type: "monster",
		monsterType: "VIRUS",
		sprite: "./spritesheet.png",
		stats: {
			HP: Math.ceil(25 + (((window as any).gameData?.days ?? 1) / 5) * 12),
			ATK: 30,
			DEF: 12,
			LUCK: 5,
			SPEED: 5,
			ELEMENT: ELEMENT.WATER,
			LEVEL: 1,
		},
		battleStats: {
			HP: Math.ceil(25 + (((window as any).gameData?.days ?? 1) / 5) * 12),
			dead: false,
		},
		effects: [],
		itemDrop: [],
	};
};

export const customer = () => {
	return {
		name: "Customer",
		type: "monster",
		monsterType: "CUSTOMER",
		sprite: "./spritesheet.png",
		stats: {
			HP: Math.ceil(50 + (((window as any).gameData?.days ?? 1) / 5) * 40),
			ATK: 50,
			DEF: 15,
			LUCK: 5,
			SPEED: 5,
			ELEMENT: ELEMENT.WATER,
			LEVEL: 1,
		},
		battleStats: {
			HP: 90,
			dead: false,
		},
		effects: [],
		itemDrop: [],
	};
};

export const deliveryCustomer = () => {
	return {
		name: "Customer",
		type: "monster",
		monsterType: "CUSTOMER_DELIVERY",
		sprite: "./spritesheet.png",
		stats: {
			HP: 180,
			ATK: 100,
			DEF: 25,
			LUCK: 5,
			SPEED: 5,
			ELEMENT: ELEMENT.WATER,
			LEVEL: 1,
		},
		battleStats: {
			HP: 180,
			dead: false,
		},
		effects: [],
		itemDrop: [],
	};
};

export const EASY_MONSTERS = [
	{ monster: bug, weight: 80 },
	{ monster: virus, weight: 20 },
];
export const MEDIUM_MONSTERS = [
	{ monster: bug, weight: 20 },
	{ monster: virus, weight: 80 },
];
export const HARD_MONSTERS = [
	{ monster: bug, weight: 1 },
	{ monster: bug, weight: 20 },
];

export const generateMonstersByPreset = (preset: string[]) => {
	const monsters = [];
	for (let i = 0; i < preset.length; i++) {
		const type = preset[i];
		if (type === "easy")
			monsters.push(EASY_MONSTERS[weightedRandom(EASY_MONSTERS)].monster());
		else if (type === "medium")
			monsters.push(MEDIUM_MONSTERS[weightedRandom(MEDIUM_MONSTERS)].monster());
		else if (type === "hard")
			monsters.push(HARD_MONSTERS[weightedRandom(HARD_MONSTERS)].monster());
	}
	return monsters;
};

export const MONSTER_PRESET_BY_RISKLEVEL = {
	1: [["easy", "easy", "easy"], ["easy", "easy"], ["easy"]],
	2: [
		["easy", "easy", "easy"],
		["easy", "easy"],
	],
	3: [
		["medium", "easy", "easy"],
		["easy", "easy", "easy", "easy"],
		["easy", "easy", "easy"],
	],
	4: [
		["medium", "easy", "easy"],
		["medium", "medium"],
		["easy", "easy", "easy"],
	],
	5: [
		["medium", "medium", "easy"],
		["medium", "easy", "easy", "easy"],
		["easy", "easy", "easy", "easy", "easy"],
	],
	6: [
		["hard", "easy", "easy"],
		["hard", "medium"],
		["medium", "easy", "easy", "easy", "easy"],
	],
	7: [
		["hard", "medium", "medium"],
		["hard", "medium", "easy", "easy"],
		["hard", "easy", "easy", "easy", "easy"],
	],
};
