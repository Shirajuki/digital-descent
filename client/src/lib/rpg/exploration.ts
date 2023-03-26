// Different areas to explore
// Each area costs 1 step, taking a chosen amount of steps will finish the quest
// - Monster should scale to players level? - type battleon style
export enum Area {
	RESTING = "resting",
	TREASURE = "treasure",
	CHALLENGE = "challenge",
	MONSTER = "monster",
	SUBQUEST = "SUBQUEST",
}
const restingArea = () => {
	console.log("resting area");
	// Player HP and MP partly recover
	const data = {};
	return { type: Area.RESTING, data: data };
};
const treasureArea = () => {
	console.log("treasure area");
	// EXP
	// Skill UP
	// Pandoras box
	const data = {};
	return { type: Area.TREASURE, data: data };
};
const challengeArea = () => {
	console.log("challenge area"); // Tower of trials, exp and treasure, but difficult
	// Tower of trials
	// - monster
	// - puzzle
	const data = {};
	return { type: Area.CHALLENGE, data: data };
};
const monsterArea = () => {
	console.log("monster area");
	// Pick and spawn a set of monsters, turn based gameplay
	const data = {};
	return { type: Area.MONSTER, data: data };
};
const subQuestArea = () => {
	console.log("more quests area"); // More rewards, but is only applied to current exploration run
	// The choice of doing more quests for rewards
	const data = {};
	return { type: Area.SUBQUEST, data: data };
};

export const areas = [
	restingArea,
	treasureArea,
	challengeArea,
	monsterArea,
	subQuestArea,
];
