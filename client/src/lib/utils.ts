export const clearFocus = () => {
	if (document.activeElement instanceof HTMLElement) {
		document.activeElement.blur();
	}
};

export const randomInt = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

export const weightedRandom = (arr: any) => {
	const cumulativeWeights: number[] = [];
	for (let i = 0; i < arr.length; i += 1) {
		cumulativeWeights.push(arr[i].weight + (cumulativeWeights[i - 1] || 0));
	}
	const randomNumber =
		Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
	for (let i = 0; i < arr.length; i += 1) {
		if (cumulativeWeights[i] >= randomNumber) {
			return i;
		}
	}
	return 0;
};

const calculateStats = (stats: any, level: number) => {
	const newStats = {
		HP: stats.HP,
		SP: stats.SP,
		ATK: stats.ATK,
		DEF: stats.DEF,
		SPEED: stats.SPEED,
	};
	for (let i = 0; i < level; i++) {
		newStats.HP += stats.HP * 0.1;
		newStats.SP += stats.SP * 0.1;
		newStats.ATK += stats.ATK * 0.1;
		newStats.DEF += stats.DEF * 0.1;
		newStats.SPEED += stats.SPEED * 0.1;
	}
	return newStats;
};

const calculateExp = (level: number) => {
	return Math.floor(100 * Math.pow(1.1, level));
};

const calculateLevel = (exp: number) => {
	return Math.floor(Math.log(exp / 100) / Math.log(1.1));
};

const calculateExpToNextLevel = (exp: number) => {
	return calculateExp(calculateLevel(exp) + 1) - exp;
};

const calculateExpToLevel = (exp: number, level: number) => {
	return calculateExp(level) - exp;
};
