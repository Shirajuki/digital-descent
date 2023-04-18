import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import BattleSystem from "../../rpg/systems/battleSystem";
import { ELEMENT } from "../../constants";

const monsterOffset = [
	{ x: 21, y: 10 },
	{ x: 22, y: 9 },
	{ x: 23, y: 11 },
	{ x: 23, y: 9 },
	{ x: 23, y: 9 },
];

const EffectHUD = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		if (engine) engine.observable.subscribe(() => forceUpdate(), "effect");
	}, [engine, forceUpdate]);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const battle: BattleSystem = (
		engine?.game.scene.getScene(engine.game.currentScene) as BattleScene
	)?.battle;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as BattleScene
	)?.player;

	if (!player || !player?.stats || !player?.battleStats || !battle)
		return <></>;

	return (
		<div
			className="absolute top-0 left-0 w-full h-full [font-family:var(--font-hud)]"
			style={{ zoom: scaling }}
		>
			{battle?.monsters?.map((monster: any, i: number) => (
				<div
					className={`absolute [user-select:none] z-20`}
					style={{
						top: `${1157 / 2 + monster.y * 1.12 - 426 + monsterOffset[i].y}px`,
						left: `${542 / 2 + monster.x * 1.12 + 285 + monsterOffset[i].x}px`,
						transform: `translate(-50%, -50%)`,
					}}
					key={monster.id}
				>
					<div className="flex gap-1">
						<div
							className="w-5 h-5 !bg-pink-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Lag (bad)"
						>
							💫
						</div>
						<div
							className="w-5 h-5 !bg-pink-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Nervous (bad)"
						>
							💦
						</div>
						<div
							className="w-5 h-5 !bg-pink-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Memory Leak (bad)"
						>
							🩸
						</div>
						<div
							className="w-5 h-5 !bg-pink-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Burn (bad)"
						>
							🔥
						</div>
						<div
							className="w-5 h-5 !bg-teal-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Hot (good)"
						>
							🌶️
						</div>
						<div
							className="w-5 h-5 !bg-teal-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Attack boost (good)"
						>
							⚔️
						</div>
						<div
							className="w-5 h-5 !bg-teal-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Defence boost (good)"
						>
							🛡️
						</div>
						<div
							className="w-5 h-5 !bg-fuchsia-900 !bg-opacity-90 rounded-sm text-[0.7rem] flex justify-center items-center"
							title="Taunting (good)"
						>
							💪
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
export default EffectHUD;
