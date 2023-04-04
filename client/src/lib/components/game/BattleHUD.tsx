import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import Battle from "../../rpg/systems/battleSystem";

const BattleHUD = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [battle, setBattle] = useState<Battle>();
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const turnIndicator = useRef(null);

	useEffect(() => {
		if (engine?.game?.scene?.getScene(engine.game.currentScene)) {
			const battleScene: BattleScene = engine.game.scene.getScene(
				engine.game.currentScene
			) as BattleScene;
			if (battleScene) setBattle(battleScene.battle);
			console.log(battleScene.battle);
		}
	}, [engine]);

	useEffect(() => {
		turnIndicator.current && autoAnimate(turnIndicator.current);
	}, [turnIndicator]);

	const normalAttack = useCallback(() => {
		battle?.doAttack("normal");
		forceUpdate();
		setTimeout(() => forceUpdate(), 4000);
	}, [battle]);
	const chargeAttack = useCallback(() => {
		battle?.doAttack("charge");
		forceUpdate();
	}, [battle]);
	const specialAttack = useCallback(() => {
		battle?.doAttack("special");
		forceUpdate();
	}, [battle]);

	return (
		<div className="absolute top-0 left-0 z-10 w-full h-full">
			{/* Battle turn indicator */}
			<div
				ref={turnIndicator}
				className="absolute top-5 left-5 flex flex-col gap-2 w-24 [user-select:none]"
			>
				{battle?.turnQueue.map((turn, i) => (
					<div
						className="bg-slate-500 rounded-sm w-11/12 text-sm py-1 px-2 first:py-2 first:w-full"
						key={`${turn.name}-${i}`}
					>
						{turn.name}
					</div>
				))}
			</div>

			{/* Party / player status information */}
			<div className="absolute top-5 right-5 text-right [user-select:none] flex flex-col gap-4">
				{battle?.players?.map((player, i) => (
					<div
						className="relative flex flex-col items-end transition-all"
						style={{
							paddingRight: battle?.turnQueue[0]?.id === player.id ? 20 : 0,
						}}
						key={`${player.id}-${i}`}
					>
						<div className="flex items-center gap-3">
							<div className="flex gap-2 items-center">
								<p className="text-xs">LV.{player.stats.LEVEL}</p>
								<p>{player.name}</p>
								<span className="px-1">•</span>
							</div>
							<div className="w-6 h-6 bg-slate-500 rotate-45 text-center text-transparent rounded-sm">
								{player.stats.ELEMENT}
							</div>
						</div>
						<div className="pr-5 flex flex-col items-end w-32">
							<p className="-my-[1px]">
								<span>{player.stats.HP}</span> / {player.stats.MAXHP}
							</p>
							<div
								className="bg-green-500 h-[0.35rem] w-full transition-all"
								style={{
									width: Math.floor(
										(player.stats.HP / player.stats.MAXHP) * 100
									),
								}}
							></div>
						</div>
					</div>
				))}
			</div>

			{/* Limit counter for Special attack */}
			<div className="absolute right-[17rem] bottom-6 flex gap-3 items-center justify-center [user-select:none]">
				<div className="flex items-center gap-2">
					<p className="text-2xl">1</p>
					<span className="opacity-80">/</span>
				</div>
				<div className="flex gap-1 h-[1.75rem] items-center justify-center">
					<div className="rotate-12 bg-slate-500 w-[0.6rem] h-[1.75rem] rounded-md"></div>
					<div className="rotate-12 bg-slate-800 w-[0.6rem] h-[1.75rem] rounded-md"></div>
					<div className="rotate-12 bg-slate-800 w-[0.6rem] h-[1.75rem] rounded-md"></div>
					<div className="rotate-12 bg-slate-800 w-[0.6rem] h-[1.75rem] rounded-md"></div>
					<div className="rotate-12 bg-slate-800 w-[0.6rem] h-[1.75rem] rounded-md"></div>
				</div>
			</div>

			{/* Button Groups for Items and Attacks */}
			<div className="absolute right-5 bottom-5 w-4/12 h-2/6 text-right">
				<div className="relative w-full h-full">
					<button className="rotate-45 w-8 h-8 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[2.75rem] right-[11.5rem]"></button>
					<button className="rotate-45 w-8 h-8 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[1rem] right-[9.75rem]"></button>

					<button
						className="rotate-45 w-16 h-16 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[3.75rem] right-[0.75rem]"
						onClick={() => specialAttack()}
					></button>
					<button
						className="rotate-45 w-16 h-16 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-2 right-[4rem]"
						onClick={() => chargeAttack()}
					></button>
					<button
						className="rotate-45 w-16 h-16 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[3.75rem] right-[7.25rem]"
						onClick={() => normalAttack()}
					></button>
				</div>
			</div>
		</div>
	);
};
export default BattleHUD;