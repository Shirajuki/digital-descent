// Different areas to explore
// Each area costs 1 step, taking a chosen amount of steps will finish the quest
// - Monster should scale to players level? - type battleon style
const restingArea = () => {
	console.log("resting area");
	// Player HP and MP partly recover
};
const treasureArea = () => {
	console.log("treasure area");
	// EXP
	// Skill UP
	// Pandoras box
};
const challengeArea = () => {
	console.log("challenge area"); // Tower of trials, exp and treasure, but difficult
	// Tower of trials
};
const monsterArea = () => {
	console.log("monster area");
	// Pick and spawn a set of monsters, turn based gameplay
};
const subQuestArea = () => {
	console.log("more quests area"); // More rewards, but is only applied to current exploration run
	// The choice of doing more quests for rewards
};

export const areas = [
	restingArea,
	treasureArea,
	challengeArea,
	monsterArea,
	subQuestArea,
];
