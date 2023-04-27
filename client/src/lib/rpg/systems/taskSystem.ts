import { weightedRandom } from "../../utils";

const squashBugs = () => {
	const count = Math.floor(Math.random() * 10) + 1;
	const task = {
		type: "BUGS",
		id: "" + Math.random(),
		task: `Squash ${count} bugs`,
		check: function () {
			const ncount = count;
			this.progress += Math.ceil(100 / ncount);
		},
		rewards: { money: 10 * count, exp: 10 * count },
		progress: 0,
		energy: Math.floor(Math.random() * 4) + 1,
		priority: 1,
	};
	return task;
};

export const TASKS = {
	BUGS: { task: squashBugs, weight: 100 },
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
