// Skill system
// Healer
export const inspire = () => {
	return {
		name: "Inspire",
		description:
			"A powerful and inspirational attack are launched against the targeted enemy, dealing moderate damage. In addition, this attack has a chance to boost a team member's morale and attack, as well as recovering a part of their HP",
		icon: "sprites/skills/inspire.png",
		icons: ["dps", "support"],
		type: "normal",
		animationType: "single-attack",
		chargeCost: 0,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 1,
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
			"The user takes a moment to delegate tasks to their team members, boosting their efficiency and morale. This charge skill restores a moderate amount of the team members HP and grants a temporary boost to the entire team's attack and defense. Additionally, the user unleashes a damaging attack that hits all enemies.",
		icon: "sprites/skills/delegate.png",
		icons: ["support", "disrupt"],
		type: "charge",
		animationType: "standing-attack",
		chargeCost: 3,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 2,
		effects: {
			attacker: ["all-attackBoost", "all-defenceBoost", "all-smallHeal"],
		},
	};
};
export const systemRestore = () => {
	return {
		name: "System Restore",
		description:
			"This skill allows the player to initiate a restart and restore on a team member's system, fully recovering their health and removing any negative status effects. In addition, the sudden jolt of energy from the restart overloads nearby enemies' systems, dealing moderate damage to all enemies making them leak memory. This skill is especially useful when a team member is critically injured or under the influence of a debilitating status effect.",
		icon: "sprites/skills/systemRestore.png",
		icons: ["support", "disrupt"],
		type: "special",
		animationType: "standing-attack",
		chargeCost: 5,
		targets: {
			type: "player",
			amount: "single",
		},
		power: 2,
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
		description:
			"This skill allows the player to launch a basic attack against the enemy, dealing minor damage. The attack targets the enemy's debugging process, causing them to waste resources and time. However, the attack's limited complexity also limits its potential damage output. This skill is useful in situations where the player needs to conserve resources or deal with weaker enemies.",
		icon: "sprites/skills/debugging.png",
		icons: ["dps"],
		type: "normal",
		animationType: "single-attack",
		chargeCost: 0,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 1,
	};
};
export const firewall = () => {
	return {
		name: "Firewall",
		description:
			"This skill allows the player to taunt enemies by creating a protective firewall around themselves. The firewall draws the attention of enemies and makes them more likely to target the player. In addition to taunting enemies, the firewall provides the player with temporary damage reduction while it's active, allowing them to absorb more damage. This skill can be useful in situations where the player needs to protect themselves or their team members from incoming attacks while still dealing damage to enemies.",
		icon: "sprites/skills/firewall.png",
		icons: ["support"],
		type: "charge",
		animationType: "standing-attack",
		chargeCost: 2,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 2,
		effects: {
			attacker: ["single-defenceBoost", "single-taunt", "single-fire"],
		},
	};
};
export const codeReview = () => {
	return {
		name: "Code Review",
		description:
			"This skill allows the player to identify and eliminate bugs in the team's code, boosting all team members' defense for a set number of turns. In addition, the player gains insights into the enemy, exposing vulnerabilities and dealing moderate damage.",
		icon: "sprites/skills/codeReview.png",
		icons: ["support"],
		type: "special",
		animationType: "standing-attack",
		chargeCost: 5,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 3,
		effects: {
			attacker: ["all-defenceBoost", "self-mediumHeal"],
			target: ["all-lag"],
		},
	};
};

// Damage dealer
export const patch = () => {
	return {
		name: "Patch",
		description:
			"Releases a patch to fix bugs in their code, dealing moderate damage to an enemy and also healing a portion of the DPS class's own health. Has a small chance to make enemy nervous.",
		icon: "sprites/skills/patch.png",
		icons: ["dps", "disrupt"],
		type: "normal",
		animationType: "single-attack",
		chargeCost: 0,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 2,
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
			"The character runs a comprehensive test suite, analyzing every aspect of the enemy and finding vulnerabilities to exploit. Deals moderate damage and applies a random debuff of either lag, nervous or memory-leak",
		icon: "sprites/skills/testSuite.png",
		icons: ["dps", "disrupt"],
		type: "charge",
		animationType: "single-attack",
		chargeCost: 2,
		targets: {
			type: "monster",
			amount: "single",
		},
		power: 4,
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
			"This skill allows the player to take a moment to refactor and optimize their own code, boosting their and the team members' attack power for a set number of turns. Additionally, the player leverages their knowledge of code optimization to target the enemy's weaknesses, dealing massive damage to all enemies. The enemy's code is temporarily disrupted for one turn.",
		icon: "sprites/skills/refactoring.png",
		icons: ["dps", "disrupt"],
		type: "charge",
		animationType: "standing-attack",
		chargeCost: 5,
		targets: {
			type: "player",
			amount: "self",
		},
		power: 5,
		effects: {
			attacker: ["all-attackBoost", "all-defenceBoost", "self-smallHeal"],
			target: ["all-lag", "all-nervous"],
		},
	};
};

// Enemies

// Customer
