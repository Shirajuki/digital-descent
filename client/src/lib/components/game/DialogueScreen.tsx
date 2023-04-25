import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import Scene from "../../scenes/scene";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const DialogueScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [infoPopup] = useAutoAnimate();
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const scene: Scene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as Scene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as BattleScene
	)?.player;

	const nextDialogue = () => {
		if (scene.dialogue.texts.length > 0) {
			scene.dialogue.texts.shift();

			if (scene.dialogue.texts.length === 0) {
				// Toggle ready
				const channel = window.channel;
				if (channel) {
					channel.emit("dialogue-end", {
						scenario: scene.dialogue.scenario,
					});
				}
			}

			forceUpdate();
		}
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.3)] rounded-md overflow-hidden [backdrop-filter:blur(1px)] flex justify-center items-center transition-all ${
				scene.dialogue?.display ? "opacity-1" : "pointer-events-none opacity-0"
			}`}
			style={{ zoom: scaling }}
		>
			{/* Info modal */}
			<div
				className="absolute bottom-7 bg-slate-900 w-[calc(100%-3.5rem)] h-44 [user-select:none] flex gap-4 rounded-md p-4"
				ref={infoPopup}
			>
				<div className="bg-slate-800 w-full flex flex-col">
					<p className="absolute -top-4 left-10 px-6 py-2 rounded-lg bg-slate-900 text-center w-auto text-3xl pb-2 [font-family:var(--font-normal)]">
						{scene.dialogue.texts[0]?.speaker || ""}
					</p>
					<div className="flex flex-col gap-3 px-6 text-center text-lg pl-2 h-full items-center justify-center">
						{scene.dialogue.texts[0]?.text ||
							"Waiting for all players to end dialogue..."}
					</div>
					<div>
						<button
							className={`absolute rounded-b-none text-sm right-4 bottom-4 bg-gray-900 w-24 text-center transition-all duration-500 ${
								false ? "!bg-green-700 !bg-opacity-70" : ""
							}`}
							onClick={() => nextDialogue()}
						>
							next →
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default DialogueScreen;
