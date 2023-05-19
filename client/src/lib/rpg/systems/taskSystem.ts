import { weightedRandom } from "../../utils";

const squashBugs = () => {
	const count = Math.floor(Math.random() * 10) + 1;
	const task = {
		type: "BUGS",
		id: "" + Math.random(),
		task: `Squash ${count} bugs`,
		count: count,
		currentCount: 0,
		rewards: { money: 10 * count, exp: 1 * count },
		progress: 0,
		energy: Math.floor(Math.random() * 4) + 1,
		priority: 1,
	};
	return task;
};
const removeViruses = () => {
	const count = Math.floor(Math.random() * 5) + 1;
	const task = {
		type: "VIRUSES",
		id: "" + Math.random(),
		task: `Remove ${count} viruses`,
		count: count,
		currentCount: 0,
		rewards: { money: 15 * count, exp: 2 * count },
		progress: 0,
		energy: Math.floor(Math.random() * 4) + 2,
		priority: 1,
	};
	return task;
};
const solveQuizes = () => {
	const count = Math.floor(Math.random() * 3) + 1;
	const task = {
		type: "QUIZES",
		id: "" + Math.random(),
		task: `Challenge Tower of Trials ${count} times`,
		count: count,
		currentCount: 0,
		rewards: { money: 10 * count, exp: 4 * count },
		progress: 0,
		energy: Math.floor(Math.random() * 4) + 2,
		priority: 1,
	};
	return task;
};

export const TASKS = {
	BUGS: { task: squashBugs, weight: 60 },
	VIRUSES: { task: removeViruses, weight: 40 },
	QUIZES: { task: solveQuizes, weight: 20 },
};

export const generateTasks = (N: number) => {
	const tasks = [];
	const openTasks = Object.values(TASKS);
	for (let i = 0; i < N; i++) {
		const task = openTasks[weightedRandom(openTasks)].task();
		tasks.push(task);
	}
	return tasks;
};
