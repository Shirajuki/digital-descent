import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "./Game";
import Lobby from "./Lobby";
import Menu from "./Menu";
import { Howl, Howler } from "howler";
import "./index.scss";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Menu />,
	},
	{
		path: "lobby",
		element: <Lobby />,
	},
	{
		path: "game",
		element: <Game />,
	},
]);

// Load volumes w/ Howler
(window as any).howler = Howler;
Howler.volume(0.2);

window.sfx = {};
window.sfx.btnClick = new Howl({
	src: ["/sfx/button-click.mp3"],
});
window.sfx.teleport = new Howl({
	src: ["/sfx/teleport.wav"],
	volume: 0.5,
});
window.sfx.togglePopup = new Howl({
	src: ["/sfx/popup-toggle.mp3"],
	volume: 0.7,
});
window.sfx.closePopup = new Howl({
	src: ["/sfx/popup-close.mp3"],
	volume: 0.7,
});
window.sfx.taskSolved = new Howl({
	src: ["/sfx/task-solved.mp3"],
	volume: 0.2,
});

// Dialogue
window.sfx.toggleDialogue = new Howl({
	src: ["/sfx/dialogue-toggle.wav"],
	volume: 0.5,
});
window.sfx.nextDialogue = new Howl({
	src: ["/sfx/dialogue-next.mp3"],
	volume: 0.5,
});

// Quiz
window.sfx.quizCorrect = new Howl({
	src: ["/sfx/quiz-correct.mp3"],
	volume: 0.8,
});
window.sfx.quizWrong = new Howl({
	src: ["/sfx/quiz-wrong.mp3"],
	volume: 0.6,
});

// Battle
window.sfx.battleHit = new Howl({
	src: ["/sfx/battle-hit.wav"],
	volume: 0.6,
});
window.sfx.battleEffect = new Howl({
	src: ["/sfx/battle-effect.wav"],
	volume: 0.2,
});

window.sfx.background = new Howl({
	src: ["/sfx/background-music.mp3"],
	volume: 0,
	autoplay: true,
	loop: true,
});
window.sfx.battleBackground = new Howl({
	src: ["/sfx/battle-background-music.mp3"],
	volume: 0,
	autoplay: true,
	loop: true,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
