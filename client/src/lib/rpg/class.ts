import {
	codeReview,
	debugging,
	delegate,
	firewall,
	inspire,
	patch,
	refactoring,
	systemRestore,
	testSuite,
} from "./skills";

// Class system

const healerSkills = {
	normal: inspire(),
	charge: delegate(),
	special: systemRestore(),
};
const tankSkills = {
	normal: debugging(),
	charge: firewall(),
	special: codeReview(),
};
const dpsSkills = {
	normal: patch(),
	charge: testSuite(),
	special: refactoring(),
};

export const getSkills = (player: any) => {
	if (player?.battleClass === "healer") {
		return healerSkills;
	} else if (player?.battleClass === "tank") {
		return tankSkills;
	} else if (player?.battleClass === "dps") {
		return dpsSkills;
	}
	return healerSkills;
};
