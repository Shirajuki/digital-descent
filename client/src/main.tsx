import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "./Game";
import Lobby from "./Lobby";
import Menu from "./Menu";
import { Howl, Howler } from "howler";
import "./index.scss";

const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <Menu />,
		},
		{
			path: "/lobby",
			element: <Lobby />,
		},
		{
			path: "/game",
			element: <Game />,
		},
	],
	{ basename: "/digital-descent" }
);

// Load volumes w/ Howler
(window as any).howler = Howler;
Howler.volume(0.2);

window.sfx = {};
window.sfx.btnClick = new Howl({
	src: ["/digital-descent/sfx/button-click.mp3"],
});
window.sfx.teleport = new Howl({
	src: ["/digital-descent/sfx/teleport.wav"],
	volume: 0.5,
});
window.sfx.togglePopup = new Howl({
	src: ["/digital-descent/sfx/popup-toggle.mp3"],
	volume: 0.7,
});
window.sfx.closePopup = new Howl({
	src: ["/digital-descent/sfx/popup-close.mp3"],
	volume: 0.7,
});
window.sfx.taskSolved = new Howl({
	src: ["/digital-descent/sfx/task-solved.mp3"],
	volume: 0.2,
});

// Dialogue
window.sfx.toggleDialogue = new Howl({
	src: ["/digital-descent/sfx/dialogue-toggle.wav"],
	volume: 0.5,
});
window.sfx.nextDialogue = new Howl({
	src: ["/digital-descent/sfx/dialogue-next.mp3"],
	volume: 0.5,
});

// Quiz
window.sfx.quizCorrect = new Howl({
	src: ["/digital-descent/sfx/quiz-correct.mp3"],
	volume: 1,
});
window.sfx.quizWrong = new Howl({
	src: ["/digital-descent/sfx/quiz-wrong.mp3"],
	volume: 1,
});

// Battle
window.sfx.battleHit = new Howl({
	src: ["/digital-descent/sfx/battle-hit.wav"],
	volume: 0.6,
});
window.sfx.battleEffect = new Howl({
	src: ["/digital-descent/sfx/battle-effect.wav"],
	volume: 0.2,
});

window.sfx.background = new Howl({
	src: ["/digital-descent/sfx/background-music.mp3"],
	volume: 0,
	autoplay: true,
	loop: true,
});
window.sfx.battleBackground = new Howl({
	src: ["/digital-descent/sfx/battle-background-music.mp3"],
	volume: 0,
	autoplay: true,
	loop: true,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
