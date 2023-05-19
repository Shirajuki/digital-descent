export const DIALOGUES = {
	// 0 - Introduction to the game
	GAME_INTRO: [
		{
			text: "Welcome, everyone! I'm glad you could join us today. I will be your team lead in this project. I'm here to provide you with all the information you require.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "We'll be developing a software solution for a customer, using the Agile Software Development methodology.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Agile is a way of developing software that focuses on collaboration, flexibility, and customer satisfaction. It's an iterative approach that involves breaking down the project into smaller, more manageable pieces, and continuously testing and delivering those pieces to the customer for feedback.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Sounds great! What's our first step?",
			speaker: "Player",
			side: "left",
		},
		{
			text: "Let's start by meeting with the customer to understand their project proposal.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Head out the meeting room. The customer will be there waiting. I will see you there.",
			speaker: "Team lead",
			side: "right",
		},
	],

	// Remember that communication and collaboration are key to Agile, so we'll be checking in with each other and the customer regularly to make sure we're on track.

	// 1 - Customer introduction
	CUSTOMER_INTRO: [
		{
			text: "Thank you for joining us today. I'm from Deep Solutions and will be your customer for this project. I'm excited to introduce you to the project. But first, I'd like to know more about your team.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Let's choose your roles now. A well-rounded team is crucial, with each role having unique stats and abilities. Introduce yourselves to the customer.",
			speaker: "Team lead",
			side: "right",
			action: "START_ROLE_SELECTION",
		},
	],

	// 2 - Choosing roles
	ROLES: [
		{
			text: "Great to see such a well rounded team! Nice to meet you all. You probably wonder what the project is by now. Our company is facing challenges with viruses and bugs in our network. The project is to develop a solution to eliminate these issues and ensure network security. I'm curious to know your approach to this project.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "We'll use Agile Software Development methodology for this project. We'll gather your requirements and break down the project into smaller tasks. Next, we'll prioritize and assign the tasks to our team members.",
			speaker: "Team lead",
			side: "left",
		},
		{
			text: "Each task will have a defined time limit within an iteration. For this project, we've set the iteration time to 5 days.",
			speaker: "Team lead",
			side: "left",
		},
		{
			text: "We'll meet at the end of each iteration to present you the progress. This keeps us on track, ensuring a high-quality product delivered on time and within budget. You can also discuss any changes you have during these meetings.",
			speaker: "Team lead",
			side: "left",
		},
		{
			text: "We'll, therefore, work closely with you, scheduling frequent customer meetings. This helps us understand the impact of changes and adjust the project plan accordingly. It ensures smooth incorporation of changes without disrupting the project timeline.",
			speaker: "Team lead",
			side: "left",
		},
		{
			text: "Thank you for explaining your approach. We're excited to work with your team and develop a high-quality software solution.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: " It's time to enter the digital world and begin your work!",
			speaker: "Team lead",
			side: "right",
			action: "TELEPORT_TO_DIGITALWORLD",
		},
	],

	// 3 - First time in the digital world
	DIGITALWORLD_INTRO: [
		{
			text: "You have now entered the digital world! To enhance productivity, we are working within a computer environment. As you can see on your screen, there is a digital representation of me. Throughout the project, I'll be present in this digital realm to offer guidance, information, and tips.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "For now, your task is explore and navigate through the stations in the digital world: the task board, workshop, and work portal. Familiarize yourself with their functions and how they align with the Agile methodology.",
			speaker: "Team lead",
			side: "right",
			action: "INITIALIZE_DIGITALWORLD_HUD",
		},
		{
			text: "In the upper left corner of your screen, you'll find your task list and a day counter, keeping you updated on your progress. You've got this!",
			speaker: "Team lead",
			image: "/sprites/dialogue/currentTaskList.png",
			side: "right",
		},
	],

	// 4 - First time accessing the task board
	TASKBOARD_INTRO: [
		{
			text: "This is the task board. This is where you'll find all the tasks and objectives that need to be completed for the project.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "As you can notice, aach task is assigned an energy cost, representing the team's capacity to handle tasks concurrently. It's crucial to consider energy usage and strategically plan which tasks to prioritize.",
			speaker: "Team lead",
			image: "/sprites/dialogue/energyTaskBoard.png",
			side: "right",
		},
		{
			text: "Completion of each task brings different rewards, with higher difficulty tasks offering greater rewards. It is important to factor in the time and energy required to accomplish each task.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Your success relies on carefully planning which tasks to prioritize and resolving as many tasks as possible within a limited timeframe. This approach ensures efficient work and helps you achieve your objectives effectively. Let's work together to complete them so the customer gets satisfied.",
			speaker: "Team lead",
			side: "right",
			action: "CLEAR_TASKBOARD_QUEST",
		},
	],

	// 5 - First time accessing the portal
	PORTAL_INTRO: [
		{
			text: "Welcome to the work portal, where the actual work takes place. Here we'll delve into the codebase in order to do our work and collaborate on the project. Let me guide you through how it operates.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Upon accessing the portal, you'll encounter two options: [work] and [delivery]. Typically, we select [work] to progress with the project. Each step within this option presents choices and challenges that we must navigate through together.",
			speaker: "Team lead",
			image: "/sprites/dialogue/portalScreen.png",
			side: "right",
		},
		{
			text: "Decision making and teamwork will be crucial for our success during work. Each time you choose to work, you'll experience a work day. There is a limited number of work days before we must meet the customer to review the progress.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "When you believe the project is ready for delivery and it's time to meet the customer for the final presentation and evaluation of the team's progress, select the second option: [delivery].",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "That should be everything you need to know about the work portal. Let's get to work!",
			speaker: "Team lead",
			side: "right",
			action: "CLEAR_PORTAL_QUEST",
		},
	],

	// 6 - First time accessing the shop
	SHOP_INTRO: [
		{
			text: "Welcome to the workshop, where you can utilize your work credits to acquire consumables and equipment that can assist you in your project. Allow me to provide an explanation of how it functions.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "To acquire consumables and equipment from the shop, start by earning work credits by working or through task board tasks. Once you have enough credits, you can exchange them for various items.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "The items includes things like energy drinks, rubber ducks, mechanical keyboards and ergonomic items that can improve your work environment and help you work more efficiently. You'll need to weigh the cost of each item against the potential benefits it can provide.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Unfortunately, the shop is currently out of order and will remain closed until further notice.",
			speaker: "Team lead",
			side: "right",
			action: "CLEAR_SHOP_QUEST",
		},
	],

	// 7 - Player game start
	BEGIN_GAME: [
		{
			text: "Great work team! We've reached the starting point. There are numerous tasks and challenges ahead of us. Keep a close eye on the task board and strategize wisely to determine our which tasks to prioritize.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Additionally, note the calendar in the upper left corner of your screen. It displays the remaining days until our meeting with the customer.",
			speaker: "Team lead",
			image: "/sprites/dialogue/calendar.png",
			side: "right",
		},
		{
			text: "I'll be here to support you from behind the scenes, if required. Best of luck, team! Let's kick off and make day 1 productive.",
			speaker: "Team lead",
			side: "right",
		},
	],

	// 8 - Meeting time!
	MEETING_TIME: [
		{
			text: "Team, it has been a few days since we embarked on this project. I trust everyone has been diligently working and making significant progress. The customer is eagerly anticipating an update on our progress.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Let's meet the customer to present our progress. Off you go!",
			speaker: "Team lead",
			side: "right",
			action: "INITIALIZE_MEETING",
		},
	],

	// 9 - Meeting with customer
	CUSTOMER_MEETING: [
		{
			text: "Ah, welcome back team. I've been eagerly waiting to see what progress you've made on the project. Can you show me what you've done?",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Certainly, we're ready to demonstrate our work, but we'll have to pass your test first right?",
			speaker: "Team lead",
			side: "left",
		},
		{
			text: "You know the drill! I have a challenge prepared for you to test your skills. Are you ready?",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Bring it on!",
			speaker: "Player",
			side: "left",
			action: "INITIALIZE_CUSTOMER_BATTLE",
		},
	],

	// 10 - Customer satisfied with milestone progress
	CUSTOMER_MEETING_WIN: [
		{
			text: "Excellent job, team. You have successfully passed my evaluation. I can see that you've been working hard on this project.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Thank you for the positive feedback. We're delighted to hear that. We will maintain our hard work and strive for further improvement in the upcoming iteration.",
			speaker: "Player",
			side: "left",
		},
		{
			text: "I look forward to seeing your progress. Keep up the great work!",
			speaker: "Customer",
			side: "right",
			action: "CUSTOMER_MEETING_WIN",
		},
	],

	// 11 - Customer NOT satisfied with milestone progress
	CUSTOMER_MEETING_LOSE: [
		{
			text: "Regrettably, the work accomplished thus far falls short of my expectations. I believe you can do better than this...",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "We'll give our all to improve next time!",
			speaker: "Player",
			side: "left",
			action: "CUSTOMER_MEETING_LOSE",
		},
	],

	// 12 - Project delivery time!
	PROJECT_DELIVERY_TIME: [
		{
			text: "Welcome back, team. Are we prepared to deliver the project? I trust everyone has been diligently working and making progress. The customer eagerly awaits the results.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "It's time to present our accomplishments to the customer. I'll send you to meet them.",
			speaker: "Team lead",
			side: "right",
			action: "INITIALIZE_PROJECT_DELIVERY",
		},
	],

	// 12.5 - Project delivery customer!
	CUSTOMER_PROJECT_DELIVERY: [
		{
			text: "It seems you're prepared to deliver the project. However, before we proceed, there is one final challenge that needs to be completed. Are you ready for it?",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Ready as we'll ever be!",
			speaker: "Player",
			side: "left",
			action: "INITIALIZE_PROJECT_DELIVERY_BATTLE",
		},
	],

	// 13 - Project delivery game win!
	PROJECT_DELIVERY_WIN: [
		{
			text: "I must express my admiration! This is precisely what I had envisioned. Your work is exceptional, and I am thoroughly satisfied with the outcome. Congratulations! The project is successfully concluded.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "That's fantastic to hear!",
			speaker: "Player",
			side: "left",
			action: "PROJECT_DELIVERY_WIN",
		},
	],

	// 14 - Project delivery try again!
	PROJECT_DELIVERY_LOSE: [
		{
			text: "I regret to inform you that my expectations were not met by your team. I am dissatisfied with the work completed. It may be necessary for you to make further efforts and try again.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Don't worry, we'll take note of your feedback and work on improving. We'll continue the work from here.",
			speaker: "Player",
			side: "left",
			action: "PROJECT_DELIVERY_LOSE",
		},
	],

	// 15 - Finish exploration
	EXPLORATION_END: [
		{
			text: "Greetings! Great work for today. Now, let's return to the digital world and resume our progress in the next day.",
			speaker: "Team lead",
			side: "right",
			action: "TELEPORT_TO_DIGITALWORLD",
		},
	],
	// 16 - Exploration intro
	EXPLORATION_INTRO: [
		{
			text: "Welcome to the codebase, our work environment. Notice the step indicator in the top middle, which displays the remaining steps for the current workday.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Additionally, there are four paths available, each leading to a distinct section of the codebase with its own set of challenges. Remember, you can only select one path per step, so choose your path wisely.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "We'll encounter various challenge modes during our journey. These include [rest] where you can restore HP, [battle] for fighting bugs, implementation issues, and technical difficulties to gain experience points, and [tower of trials] mode, where we'll collaborate to solve quizzes and puzzles through effective communication.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "A crucial aspect of the challenge is determining what needs to be done and how to approach it. Collaborating as a team will be key in finding the most effective solutions to tasks and overcoming the challenges. Get ready to embark on an exciting exploration!",
			speaker: "Team lead",
			side: "right",
		},
	],
	// 17 - Battle intro
	BATTLE_INTRO: [
		{
			text: "Welcome to the battle arena, where you'll engage in combat against the different obstacles you meet during your work. Let me explain the battle system in more detail.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Each of you have three different attack skills depending on your team role, some of which costs energy to use. Attacking normally recovers charge points.",
			speaker: "Team lead",
			image: "/sprites/dialogue/battle.png",
			side: "right",
		},
		{
			text: "Use the attack skills you have to defeat the enemies and complete your tasks.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "If you find yourself stuck or unsure about what to do, don't worry. You can always utilize the help button located in the bottom right corner. It will provide you with information about the skills you have available and their respective functions. This can assist you in finding a way forward. Good luck!",
			speaker: "Team lead",
			side: "right",
		},
	],
};
