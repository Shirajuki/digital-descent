// Skill system
// Healer
export const inspire = () => {
	return {
		name: "Inspire",
		description:
			"An inspirational attack against a targeted enemy. This attack has also a chance to boost the teams's morale and attack, as well as recovering a part of their HP",
		icon: "sprites/skills/inspire.png",
		icons: ["dps", "support"],
		type: "normal",
		animationType: "single-attack",
		chargeCost: 0,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 0,
		effects: {
			attacker: ["all-smallHeal", "all-attackBoost"],
			attackerAccuracy: 30,
		},
	};
};
export const delegate = () => {
	return {
		name: "Delegate",
		description:
			"Delegate tasks to the team members, boosting their efficiency. This restores the team's HP and grants the whole team a temporary boost in attack and defense. Additionally, a damaging attack that hits all enemies are unleashed.",
		icon: "sprites/skills/delegate.png",
		icons: ["support", "disrupt"],
		type: "charge",
		animationType: "standing-attack",
		chargeCost: 3,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 0.5,
		effects: {
			attacker: ["all-attackBoost", "all-defenceBoost", "all-mediumHeal"],
		},
	};
};
export const systemRestore = () => {
	return {
		name: "System Restore",
		description:
			"Initiate a restart and restore on a team member's system, fully recovering their health and removing any negative status effects. The jolt of energy from the restart also deals damage to all enemies making them leak memory.",
		icon: "sprites/skills/systemRestore.png",
		icons: ["support", "disrupt"],
		type: "special",
		animationType: "standing-attack",
		chargeCost: 5,
		targets: {
			type: "player",
			amount: "single",
		},
		power: 1.5,
		effects: {
			attacker: ["all-largeHeal", "all-clear"],
			target: ["all-memoryLeak"],
		},
	};
};

// Tank
export const debugging = () => {
	return {
		name: "Debugging",
		description: "Launches a basic debugging attack against a targeted enemy.",
		icon: "sprites/skills/debugging.png",
		icons: ["dps"],
		type: "normal",
		animationType: "single-attack",
		chargeCost: 0,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 0,
		effects: {
			attacker: ["single-smallHeal"],
		},
	};
};
export const firewall = () => {
	return {
		name: "Firewall",
		description:
			"Creates a protective firewall around the player. The firewall draws the attention of enemies and makes them more likely to target the player, as well as granting the player a temporary defence boost, allowing them to absorb more damage.",
		icon: "sprites/skills/firewall.png",
		icons: ["support"],
		type: "charge",
		animationType: "standing-attack",
		chargeCost: 2,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 0.5,
		effects: {
			attacker: ["single-defenceBoost", "single-taunt"],
		},
	};
};
export const codeReview = () => {
	return {
		name: "Code Review",
		description:
			"Identify and eliminate bugs in the team's code, temporary boosting all team members' defense. In addition, the player deals moderate damage to all enemies.",
		icon: "sprites/skills/codeReview.png",
		icons: ["support"],
		type: "special",
		animationType: "standing-attack",
		chargeCost: 5,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 1.5,
		effects: {
			attacker: ["all-defenceBoost", "single-mediumHeal"],
			target: ["all-lag"],
		},
	};
};

// Damage dealer
export const patch = () => {
	return {
		name: "Patch",
		description:
			"Releases a patch to fix bugs in the codebase, dealing moderate damage to a targeted enemy. Has a small chance to make the enemy nervous, becoming weaker to further attacks.",
		icon: "sprites/skills/patch.png",
		icons: ["dps", "disrupt"],
		type: "normal",
		animationType: "single-attack",
		chargeCost: 0,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 0.5,
		effects: {
			target: ["single-nervous"],
			targetAccuracy: 30,
		},
	};
};
export const testSuite = () => {
	const randomStatus = ["single-lag", "single-nervous", "single-memoryLeak"][
		Math.floor(Math.random() * 3)
	];
	return {
		name: "Test Suite",
		description:
			"Runs a comprehensive test suite, analyzing every aspect of the targeted enemy dealing massive damage. A random debuff of either lag, nervous or memory-leak are also applied to the targeted enemy.",
		icon: "sprites/skills/testSuite.png",
		icons: ["dps", "disrupt"],
		type: "charge",
		animationType: "single-attack",
		chargeCost: 2,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 1.5,
		effects: {
			target: [randomStatus],
			targetAccuracy: 100,
		},
	};
};
export const refactoring = () => {
	return {
		name: "Refactoring",
		description:
			"The player takes a moment to refactor and optimize the codebase, boosting their and the team members' attack power for a set number of turns. Additionally, the player deals massive damage and applies lag to all enemies.",
		icon: "sprites/skills/refactoring.png",
		icons: ["dps", "disrupt"],
		type: "charge",
		animationType: "standing-attack",
		chargeCost: 5,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 2.5,
		effects: {
			attacker: ["all-attackBoost", "single-mediumHeal"],
			target: ["all-lag", "all-nervous"],
		},
	};
};

// Customer
