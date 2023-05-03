export const DIALOGUES = {
	// 0 - Introduction to the game
	GAME_INTRO: [
		{
			text: "Welcome, everyone! I'm glad you could join us today. I will be your team lead in this project. I am here to tell you everything you need to know.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Thanks for having us. Can you tell us more about what we'll be doing?",
			speaker: "Player",
			side: "left",
		},
		{
			text: "Absolutely. We'll be developing a software solution for a customer, and we'll be using Agile software development methodology to do it.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Agile? I've heard of it, but I'm not sure what it is",
			speaker: "Player",
			side: "left",
		},
		{
			text: "Agile is a way of developing software that focuses on collaboration, flexibility, and customer satisfaction. It's an iterative approach that involves breaking down the project into smaller, more manageable pieces, and continuously testing and delivering those pieces to the customer for feedback.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "That sounds like a lot of work. How do we keep track of everything?",
			speaker: "Player",
			side: "left",
		},
		{
			text: "Good question. That's where Agile project management tools and processes come in. We can use tools like task boards and meetings with the customer to keep track of our progress and make sure everyone is on the same page. It is important to note here that you decide what tools you want to use and customize how you prefer to use it.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Okay, I'm starting to get the hang of it. What's our first step?",
			speaker: "Player",
			side: "left",
		},
		{
			text: "Our first step is to meet with the customer and get to know what project they are proposing. From there, we'll break down the project into smaller tasks and start working on them. But remember, communication and collaboration are key to Agile, so we'll be checking in with each other and the customer regularly to make sure we're on track. Are you ready to start?",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Yes, I'm excited to learn more about Agile and work on this project.",
			speaker: "Player",
			side: "left",
		},
		{
			text: "Great to hear. Let's get started! Head out the meeting room. The customer will be there waiting. I will see you there.",
			speaker: "Team lead",
			side: "right",
		},
	],

	// 1 - Customer introduction
	CUSTOMER_INTRO: [
		{
			text: "Thank you for joining us today. I come from the company Deep Solutions and will be your customer for this project. I am excited to be able to introduce you to the project. First I would like to know more about your team.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Now it is time to choose the role you want to be in the team guys. A well rounded team is important and each role will have different stats and specialize in have different abilities. Introduce yourselves to the customer.\n",
			speaker: "Team lead",
			side: "right",
			action: "START_ROLE_SELECTION",
		},
	],

	// 2 - Choosing roles
	ROLES: [
		{
			text: "Great to see such a well rounded team! Nice to meet you guys. You probably wonder what the project is by now. My company is struggling to keep out viruses in our network. The project is to build a solution to get rid of these viruses and keep our network safe. Now I wonder how you will approach this project?",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "We will be using the Agile Software development methodology in this project. We'll begin by gathering your requirements and breaking down the project into smaller tasks. We'll then prioritize those tasks and assign them to our team members.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Each task will be developed in a iteration with a defined time limit. In this project we set the iteration time to be 5 days, and we'll have a set of deliverables at the end of each iteration. This allows us to stay on track and deliver a high-quality product on time and within budget. After each iteration we will meet you to present you the progress. You will be able to discuss any changes you have.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "That's impressive. How will you handle changes in requirements?",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Changes in requirements are expected.  We will try to work closely with you and have frequent customer meeting to understand the impact of the change on the project and adjusting the project plan accordingly. This ensures that any changes are incorporated smoothly and without disrupting the project timeline.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Thank you for explaining your approach. We're excited to see what your team can do and look forward to working with you to develop a high-quality software solution.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Now it's time for you to enter the digital world and start your work!",
			speaker: "Team lead",
			side: "right",
			action: "TELEPORT_TO_DIGITALWORLD",
		},
	],

	// 3 - First time in the digital world
	DIGITALWORLD_INTRO: [
		{
			text: "Welcome to the digital world! In order to work efficiently, you have now entered inside a computer. As you can see, there is a digital version of me on your screen. I will appear inside this world throughout the project to give you information and tips.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "In the upper left corner of your screen, you'll see your current task list, as well as a counter showing how many days you've worked on the project. This list is closely connected to our work iterations, since we'll set out an objective to satisfy the customer for each iteration.\n",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "For now, your task is to visit the stations found in the digital world: the Task Board, the workshop, and the work portal. In each station you will understand how they work and how they relate to the Agile methodology. You got this!\n",
			speaker: "Team lead",
			side: "right",
			action: "INITIALIZE_DIGITALWORLD_HUD",
		},
	],

	// 4 - First time accessing the task board
	TASKBOARD_INTRO: [
		{
			text: "This is the Task Board. This is where you'll find all the tasks and objectives that need to be completed for the project.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "First, you'll notice that each task has an energy cost associated with it. This indicates that there's a limit to how many tasks the team can take on at the same time. We need to be mindful of our energy usage and plan out which tasks we want to focus on.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Each task also has a priority and a difficulty level, which determines the rewards we'll receive upon completion. The more difficult the task, the higher the reward. However, we also need to consider the time and energy it will take to complete the task.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "You have to thoroughly plan out which tasks to focus on and solve as many tasks as possible in the shortest amount of time. This will help you work effectively and achieve the objectives efficiently.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "So, take a look at the tasks on the board, consider the energy costs, priorities, and rewards, and let's work together to complete them so the customer gets satisfied.",
			speaker: "Team lead",
			side: "right",
			action: "CLEAR_TASKBOARD_QUEST",
		},
	],

	// 5 - First time accessing the portal
	PORTAL_INTRO: [
		{
			text: "This is the portal. Here is where the actual work takes place. This is where we'll journey off to the codebase in order to do our work and collaborate to reach our final destination together. Let me explain how it works.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "When you access the Portal, you'll be given two options: WORK and DELIVERY. The normal flow is to choose WORK, where we'll take steps towards completing the project. Each step will be filled with choices and challenges that we'll need to navigate through.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Decision making and teamwork will be key to our success when working. Each time you select to work, you will go through a work day. There will be a limited time of work days before you have to meet the customer to check up on the progress.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "When you feel that you've ready to deliver the project and meet the customer for a final presentation and showdown on the team's progress. Then pick the second option: DELIVERY.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "The different challenge modes that we'll encounter include REST, where we can restore our HP points, BATTLE where we'll battle bugs, glitches and monsters for experience points, TOWER OF TRIALS where we'll have to collaboratively solve puzzles through communication, and SHOP where we can take a stop to buy consumables and special equipment to help us on our journey.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Let me explain the battling system in more detail. During battle, you'll have a variety of actions available to you, including attacking, defending, using items, and special/charge attacks that deal more damage. You'll need to use your SP points wisely and strategically to defeat the enemies we encounter along the way.",
			speaker: "Team lead",
			side: "right",
			action: "CLEAR_PORTAL_QUEST",
		},
	],

	// 6 - First time accessing the shop
	SHOP_INTRO: [
		{
			text: "This is the shop and this is where you can exchange your work credits for consumables and equipment to help you on your project. Let me explain how it works.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "First, you'll need to earn work credits by completing tasks on the Task Board. Once you have enough, you can exchange them at the Shop for consumables and equipment. Consumables include things like different type of energy drinks and sodas that can help you stay focused and energized during your work.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Equipment includes things like rubber ducks, mechanical keyboards and ergonomic items that can improve your work environment and help you work more efficiently. You'll need to weigh the cost of each item against the potential benefits it can provide.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Remember, the goal of the Shop is to provide you with resources to help you complete your work more effectively, so choose wisely and don't waste your work credits on unnecessary items.",
			speaker: "Team lead",
			side: "right",
			action: "CLEAR_SHOP_QUEST",
		},
	],

	// 7 - Player game start
	BEGIN_GAME: [
		{
			text: "Alright team, we have reached the starting point. As you can see, we have a lot of tasks to complete and challenges to overcome. Remember to check the task board frequently and plan carefully which tasks we should focus on.",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "I'll be here to assist you in the background if needed, but for now, good luck team. Let's get started and make day 1 a productive one.",
			speaker: "Team lead",
			side: "right",
		},
	],

	// 8 - Meeting time!
	MEETING_TIME: [
		{
			text: "Hello team, it's been a few days since we started working on this project. I hope you've all been working hard and making progress. The customer is waiting for an update on the progress",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "Now it's time to meet with the customer to show them what we've accomplished so far. Head to the portal and I'll send you on your way to the customer.",
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
			text: "Certainly, we're ready to demonstrate our work. But first, we have to pass your test, right?",
			speaker: "Team lead",
			side: "right",
		},
		{
			text: "That's correct. I have a challenge prepared for you to test your skills. Are you ready?",
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
			text: "Impressive work team, you passed my test. I can see that you've been working hard on this project.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Thank you, we're glad to hear that. We'll continue to work hard and improve in the next iteration",
			speaker: "Player",
			side: "left",
		},
		{
			text: "I look forward to seeing your progress. Keep up the good work.",
			speaker: "Customer",
			side: "right",
			action: "CUSTOMER_MEETING_WIN",
		},
	],

	// 11 - Customer NOT satisfied with milestone progress
	CUSTOMER_MEETING_LOSE: [
		{
			text: "Unfortunately, I'm not satisfied with the work done thus far. I believe you can do better than this.",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "We will do it better next time!",
			speaker: "Player",
			side: "left",
			action: "CUSTOMER_MEETING_LOSE",
		},
	],

	// 12 - Project delivery time!
	PROJECT_DELIVERY_TIME: [
		{
			text: "I see that you feel ready to deliver the project. But, first you have to complete a last challenge. Are you ready?",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Ready as we'll ever be!",
			speaker: "Player",
			side: "left",
			action: "INITIALIZE_PROJECT_DELIVERY",
		},
	],

	// 13 - Project delivery game win!
	PROJECT_DELIVERY_WIN: [
		{
			text: "I must say, I'm impressed! This is exactly what I was looking for. You've done a great job, and I'm satisfied with the work you've done. Congratulations, you have completed the project!",
			speaker: "Customer",
			side: "right",
		},
		{
			text: "Awesome to hear!",
			speaker: "Player",
			side: "left",
			action: "PROJECT_DELIVERY_WIN",
		},
	],

	// 14 - Project delivery try again!
	PROJECT_DELIVERY_LOSE: [
		{
			text: "I'm sorry, but I expected more from your team. I'm not satisfied with the work done.",
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
			text: "Greetings! Great work for today. For now, let's head back to the digital world and we'll continue tomorrow.",
			speaker: "Team lead",
			side: "right",
			action: "TELEPORT_TO_DIGITALWORLD",
		},
	],
};
