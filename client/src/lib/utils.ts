export const lerp = (a: number, b: number, n: number) => {
	return (1 - n) * a + n * b;
};
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

export const calculateExpToNextLevel = (player: any) => {
	return Math.floor((4 * Math.pow(player.stats.LEVEL, 3)) / 5);
};
