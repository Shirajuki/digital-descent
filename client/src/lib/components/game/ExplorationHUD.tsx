import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import BattleSystem from "../../rpg/systems/battleSystem";
import { ELEMENT } from "../../constants";
import EffectIcon from "./EffectIcon";
import DigitalWorldScene from "../../scenes/digitalworld";
import ExplorationScene from "../../scenes/exploration";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const ExplorationHUD = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);

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
		engine?.game.scene.getScene(engine.game.currentScene) as ExplorationScene
	)?.player;

	if (!player || !scene) return <></>;

	return (
		<div
			className="absolute top-0 left-0 z-10 w-full h-full [font-family:var(--font-hud)]"
			style={{ zoom: scaling }}
		>
			{/* Taskboard, day and milestone */}
			<div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col gap-2 [user-select:none]">
				<div className="flex gap-1">
					<div className="bg-slate-500 rounded-sm w-28 text-center text-sm py-2 px-2">
						Steps: {scene.game.data.steps} / 6
					</div>
				</div>
			</div>
		</div>
	);
};
export default ExplorationHUD;
