// Different areas to explore
// Each area costs 1 step, taking a chosen amount of steps will finish the quest
import { weightedRandom } from "../../utils";

// - Monster should scale to players level? - type battleon style
const startingArea = () => {
	console.log("starting area");
	// Player HP and MP full hp
	// Starting point, nothing fancy
	const data = {};
	return { type: "STARTING", data: data };
};
const restingArea = () => {
	console.log("resting area");
	// Player HP and MP partly recover
	const data = {};
	return { type: "RESTING", data: data };
};
const treasureArea = () => {
	console.log("treasure area");
	// EXP
	// Skill UP
	// Pandoras box
	const data = {};
	return { type: "TREASURE", data: data };
};
const challengeArea = () => {
	console.log("challenge area"); // Tower of trials, exp and treasure, but difficult
	// Tower of trials
	// - monster
	// - puzzle
	const data = {};
	return { type: "CHALLENGE", data: data };
};
const battleArea = () => {
	console.log("battle area");
	// Pick and spawn a set of monsters, turn based gameplay
	const data = {};
	return { type: "BATTLE", data: data };
};
const subQuestArea = () => {
	console.log("more quests area"); // More rewards, but is only applied to current exploration run
	// The choice of doing more quests for rewards
	const data = {};
	return { type: "SUBQUEST", data: data };
};
const shopArea = () => {
	console.log("shop"); // Shop to sell dropped items / buy potions or equipments
	// The choice of doing more quests for rewards
	const data = {};
	return { type: "SHOP", data: data };
};

export const AREAS = {
	STARTING: { area: startingArea, weight: 0 },
	RESTING: { area: restingArea, weight: 20 },
	TREASURE: { area: treasureArea, weight: 10 },
	CHALLENGE: { area: challengeArea, weight: 30 },
	BATTLE: { area: battleArea, weight: 60 },
	// SUBQUEST: { area: subQuestArea, weight: 15 },
	// SHOP: { area: shopArea, weight: 15 },
};

export const generateAvailableAreas = () => {
	const areas = [];
	const availableAreas = Object.values(AREAS);
	for (let i = 0; i < 4; i++) {
		const area = availableAreas[weightedRandom(availableAreas)].area();
		areas.push(area);
	}
	return areas;
};
