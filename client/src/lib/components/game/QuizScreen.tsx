import { useAtom } from "jotai";
import { engineAtom, selectsAtom, socketAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import DigitalWorldScene from "../../scenes/digitalworld";
import OfficeScene from "../../scenes/office";
import { PLAYER_COLORS } from "../../constants";
import ExplorationScene from "../../scenes/exploration";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const QuizScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [infoPopup] = useAutoAnimate();
	const [answer, setAnswer] = useState<number | null>(null);
	const [selects, setSelects] = useAtom(selectsAtom);
	const [socket, _setSocket] = useAtom(socketAtom);
	const [pause, setPause] = useState(false);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const scene: ExplorationScene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as ExplorationScene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as OfficeScene
	)?.player;

	useEffect(() => {
		const channel = socket;
		if (!channel) return;

		channel.on("selects", (data: any) => {
			if (data.type === "selects-update") {
				setSelects(data.selects);
				forceUpdate();
			}
		});
		channel.on("quiz-correct", () => {
			if (!pause) return;
			console.log("correct!");
			setPause(false);
			toggleQuiz();
			scene.game.data.money += scene?.quiz?.rewards;

			setSelects((oldSelects: any) => {
				const newSelects = { ...oldSelects };
				Object.keys(newSelects).forEach((key) => {
					newSelects[key] = null;
				});
				return newSelects;
			});
		});
		channel.on("quiz-wrong", () => {
			if (!pause) return;
			console.log("wrong!");
			setPause(false);
			if (scene?.quiz?.rewards) {
				scene.quiz.rewards -= 10;
			}
			setSelects((oldSelects: any) => {
				const newSelects = { ...oldSelects };
				Object.keys(newSelects).forEach((key) => {
					newSelects[key] = null;
				});
				return newSelects;
			});
		});
		forceUpdate();

		return () => {
			channel.off("selects");
			channel.off("quiz-correct");
			channel.off("quiz-wrong");
		};
	}, [socket, setPause, pause, setSelects, forceUpdate, player]);

	useEffect(() => {
		if (answer === null || !setPause || pause) return;
		console.log(selects);
		const sel = Object.values(selects);
		const selSet = new Set(sel);

		// If everyone has selected an answer
		if (scene?.players.length === sel.length && selSet.size === 1) {
			const [first] = selSet;
			if (first === null) return;
			// Mannally reset selects after teleporting
			setTimeout(() => {
				window.channel.emit("selects-reset", {
					id: player.id,
				});
			}, 200);
			setPause(true);
			window.channel.emit("quiz-update", {
				id: player.id,
				answer: scene?.quiz?.answers[answer],
			});
			scene.observable.notify();
		}
	}, [answer, selects, pause, setPause]);

	const toggleQuiz = () => {
		if (scene?.quiz?.display) {
			window.channel.emit("selects-reset", {
				id: window.channel.id,
			});

			scene.quiz.display = false;
			scene.checkSteps();
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.quiz?.display ? "opacity-1" : "pointer-events-none opacity-0"
			}`}
			style={{ zoom: scaling }}
		>
			{/* Info modal */}
			<div
				className="absolute bg-slate-900 w-[calc(100%-8rem)] h-[calc(100%-6rem)] [user-select:none] flex gap-4 rounded-md p-4"
				ref={infoPopup}
			>
				<div className="bg-slate-800 w-full flex flex-col gap-4 p-4">
					<h1 className="block w-full text-center text-3xl pb-2 [font-family:var(--font-normal)]">
						Quiz
					</h1>
					<div className="flex flex-col h-full justify-between">
						<div className="flex items-center justify-center">
							<h4 className="text-md text-center [font-family:var(--font-normal)]">
								{scene?.quiz?.question}
							</h4>
						</div>
						<div className="flex flex-col gap-4">
							{scene?.quiz?.answers?.map((answer: any, index: number) => (
								<button
									className="relative bg-gray-900 w-full text-center transition-all duration-500"
									onClick={() => {
										window.channel.emit("selects-update", {
											id: player.id,
											select: "" + index,
										});
										setAnswer(0);
									}}
									key={"quizanswer" + index}
								>
									{scene?.players?.map((p, i) => {
										if (selects[p?.id] !== "" + index)
											return (
												<div key={"quizselect" + i} className="hidden"></div>
											);
										return (
											<div
												key={"quizselect" + i}
												className={`absolute top-0 h-5 w-5 ${
													PLAYER_COLORS[i % PLAYER_COLORS.length]
												} -translate-x-2 -translate-y-2 rotate-45`}
												style={{ left: i * 32 }}
												title={p.name}
											></div>
										);
									})}
									<p className="text-sm">{answer}</p>
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default QuizScreen;
