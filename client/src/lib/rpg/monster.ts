import { weightedRandom } from "../utils";
import { ELEMENT } from "./../constants";
/*

Code Smell - Monsters that are made of lines of code or bugs that have come to life.
- Magic Number - These monsters use magic numbers to control the behavior of your game. They can make your game hard to understand, hard to modify, and prone to bugs.

Debugger Demons - These are enemies that try to fix the bugs in your code while you are fighting them.

Server Overload - An enemy that tries to overload your server and cause a system crash.

HTML Horrors - These monsters are made of malformed HTML tags and can cause your game to display incorrectly.

CSS Creeps - These monsters use cascading style sheets to blend in with their surroundings and become hard to hit.

API Abominations - These monsters use APIs to call in reinforcements and gain an advantage in battle.

Git Ghouls - These monsters use Git repositories to store their code, making it hard to track down and defeat them.

SQL Injection Snakes - These venomous snakes use SQL injection attacks to corrupt your game's database and steal your data. They can use techniques like UNION queries, time-based attacks, and error-based attacks to bypass your defenses.

Spaghetti Code Spectres - These are ghostly creatures that haunt your codebase with their tangled, confusing, and hard-to-follow code. They can make your game sluggish, hard to maintain, and prone to bugs.

Race Condition Raptors - These monsters are like cheetahs that race through your code, leaving behind a trail of destruction. They can cause your game to behave unpredictably, produce incorrect results, and cause hard-to-diagnose bugs.

Memory Leak Monsters - These monsters are like vampires that suck the life out of your game's memory. They can cause your game to slow down, produce unexpected behavior, and eventually crash.

Division by Zero Demons - These monsters are like demons that divide by zero, causing your game to crash or produce unexpected results. They can cause your game to behave unpredictably, produce incorrect results, and cause hard-to-diagnose bugs.

Web Crawler Worms - These are worm-like creatures that crawl through your codebase, leaving behind a trail of destruction. They can cause your game to become slow, unresponsive, and prone to crashes.

Code Munching Caterpillars - These caterpillar-like monsters have a voracious appetite for code. They can cause your game to become buggy, unstable, and hard to maintain.

Debugging Ants - These are ants that crawl through your codebase, searching for bugs to fix. They can help you eliminate bugs in your game, but they can also introduce new ones if they are not careful.

Syntax Error Spiders - These spider-like monsters spin webs of syntax errors in your codebase. They can cause your game to become unplayable, prone to crashes, and hard to debug.

Cross-Site Scripting Beetles - These are beetle-like creatures that inject malicious code into your game's codebase. They can cause your game to become vulnerable to attacks, produce unexpected results, and become hard to secure.

Version Control Cockroaches - These are resilient cockroach-like monsters that infest your codebase. They can cause your game to become unstable, hard to maintain, and prone to bugs.

Data Corruption Centipedes - These are centipede-like monsters that crawl through your game's data structures, causing them to become corrupted. They can cause your game to produce unexpected results, crash, or become unplayable.

CSS Spider - This spider-like monster spins webs of CSS code that cause your game's layout to become distorted and difficult to use. They can cause your game to become unplayable and hard to navigate.

Git Beetle - This beetle-like monster infests your game's codebase, causing conflicts and merge errors in your Git repository. They can cause your game's development process to become chaotic and hard to manage.

SQL Scorpion - This scorpion-like monster injects malicious SQL code into your game's database, causing data leaks and potential security vulnerabilities. They can cause your game to become vulnerable to attacks, produce unexpected results, and become hard to secure.

API Mosquito - This mosquito-like monster sucks the life out of your game's APIs, causing them to become slow, unresponsive, and prone to crashes. They can cause your game to become unplayable and hard to use.

CSS Cockroach - This resilient cockroach-like monster infests your game's CSS files, causing them to become bloated and difficult to maintain. They can cause your game to become slow, unresponsive, and hard to navigate.

Git Moth - This moth-like monster eats away at your game's codebase, causing it to become difficult to read and understand. They can cause your game's development process to become slow and frustrating.

API Firefly - This firefly-like monster emits bright flashes of API responses that overwhelm your game's network and cause it to become unresponsive. They can cause your game to become slow, unplayable, and prone to crashes.

*/

const bug = () => {
	return {
		name: "Bug",
		type: "monster",
		monsterType: "BUG",
		sprite: "./spritesheet.png",
		stats: {
			HP: 10,
			ATK: 10,
			DEF: 10,
			SPEED: 5,
			ELEMENT: ELEMENT.WATER,
			LEVEL: 1,
		},
		battleStats: {
			HP: 10,
			dead: false,
		},
		effects: [],
		itemDrop: [],
	};
};

export const EASY_MONSTERS = [
	{ monster: bug, weight: 1 },
	{ monster: bug, weight: 20 },
];
export const MEDIUM_MONSTERS = [
	{ monster: bug, weight: 1 },
	{ monster: bug, weight: 20 },
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
