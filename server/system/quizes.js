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
		question: "What is the capital of the United States?",
		answer: "Washington D.C.",
		choices: ["New York", "Washington D.C.", "Los Angeles", "Chicago"],
		weight: 10,
	},
	{
		quiz: {
			question: "What is the capital of Japan?",
			answer: "Tokyo",
			choices: ["Osaka", "Tokyo", "Kyoto", "Hiroshima"],
		},
		weight: 10,
	},
	{
		quiz: {
			question: "What is the capital of South Korea?",
			answer: "Seoul",
			choices: ["Busan", "Seoul", "Incheon", "Jeju"],
		},
		weight: 10,
	},
	{
		quiz: {
			question: "What is the capital of China?",
			answer: "Beijing",
			choices: ["Shanghai", "Beijing", "Hong Kong", "Macau"],
		},
		weight: 10,
	},
	{
		quiz: {
			question: "What is the capital of Thailand?",
			answer: "Bangkok",
			choices: ["Phuket", "Bangkok", "Chiang Mai", "Pattaya"],
		},
		weight: 10,
	},
	{
		quiz: {
			question: "What is the capital of Singapore?",
			answer: "Singapore",
			choices: ["Singapore", "Kuala Lumpur", "Jakarta", "Bangkok"],
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
