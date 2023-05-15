export const QUIZ = () => [
	{
		quiz: {
			question: "What is the Agile Manifesto?",
			answer: "A set of values and principles for agile software development",
			choices: [
				"A document outlining the principles of traditional software development",
				"A set of values and principles for agile software development",
				"A methodology for project management",
				"A software tool used for agile development",
			],
		},
		weight: 10,
	},
	{
		question: "What is the purpose of the frequent (standup) meeting?",
		answer: "To review the previous day's work and keep everyone in sync",
		choices: [
			"To discuss progress and roadblocks",
			"To assign tasks to team members",
			"To review the project backlog",
			"To review the previous day's work and keep everyone in sync",
		],
		weight: 10,
	},
	{
		quiz: {
			question:
				"What is the benefit of using a task board in agile software development?",
			answer:
				"It provides a visual representation of project progress and status",
			choices: [
				"It helps keep track of team member attendance",
				"It provides a visual representation of project progress and status",
				"It automatically assigns tasks to team members",
				"It generates reports for upper management",
			],
		},
		weight: 10,
	},
	{
		quiz: {
			question:
				"What is the benefit of iterative development and incremental design?",
			answer: "It allows for quick and frequent feedback from stakeholders",
			choices: [
				"It allows for quick and frequent feedback from stakeholders",
				"It reduces the need for collaboration among team members",
				"It allows for more time to be spent on planning and design",
				"It reduces the need for testing and quality assurance",
			],
		},
		weight: 10,
	},
	{
		quiz: {
			question:
				"What is the importance of promoting and cultivating the agile mindset?",
			answer:
				"It helps ensure project success by encouraging flexibility and adaptability",
			choices: [
				"It helps ensure project success by encouraging flexibility and adaptability",
				"It reduces the need for communication and collaboration among team members",
				"It allows for a more rigid project structure",
				"It encourages a focus on individual performance rather than team performance",
			],
		},
		weight: 10,
	},
];

const weightedRandom = (arr) => {
	const cumulativeWeights = [];
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

export const getRandomQuiz = (quiz) => {
	return weightedRandom(quiz);
};
