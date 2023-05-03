import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import BattleSystem from "../../rpg/systems/battleSystem";
import { ELEMENT } from "../../constants";
import EffectIcon from "./EffectIcon";
import DigitalWorldScene from "../../scenes/digitalworld";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const DigitalWorldHUD = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [textPopup] = useAutoAnimate();

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const scene: DigitalWorldScene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as DigitalWorldScene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as DigitalWorldScene
	)?.player;

	if (!player || !scene) return <></>;

	return (
		<div
			className="absolute top-0 left-0 z-10 w-full h-full [font-family:var(--font-hud)]"
			style={{ zoom: scaling }}
		>
			{/* Taskboard, day and milestone */}
			<div className="absolute top-5 left-5 flex flex-col gap-2 [user-select:none]">
				<div className="flex gap-1">
					<div className="bg-slate-500 rounded-sm w-16 text-sm py-2 px-2">
						Day {engine?.game.data.days}
					</div>
					<div className="bg-slate-500 rounded-sm w-36 text-sm py-2 px-2">
						WORKDAY
					</div>
				</div>
				<div className="flex flex-col gap-1">
					{engine?.game.data.currentTasks.map((currentTask: any, i: number) => (
						<div key={`task-${i}`} className="inline-block rounded-sm text-sm">
							<div className="inline-block bg-slate-500 py-1 px-2 rounded-sm">
								{currentTask.task}「{currentTask.progress}%」
							</div>
						</div>
					))}
					{engine?.game.data.solvedTasks.map((solvedTask: any, i: number) => {
						if (!solvedTask.done === engine?.game.data.days) return <></>;
						return (
							<div
								key={`task-${i}`}
								className="inline-block rounded-sm text-sm"
							>
								<div className="inline-block bg-slate-500 py-1 px-2 rounded-sm opacity-50">
									{solvedTask.task}「{solvedTask.progress}%」
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Party / player status information */}
			<div className="absolute top-5 right-5 text-right [user-select:none] flex flex-col gap-4">
				{scene.players
					?.filter((player) => player.stats && player.battleStats)
					.map((player, i) => (
						<div
							className={`relative flex flex-col items-end transition-all bg-[rgba(0,0,0,0.7)] py-2 px-3 rounded-md ${
								player.id === scene.player.id ? "!bg-zinc-900" : ""
							}`}
							key={`${player.id}-${i}`}
						>
							<div className="flex items-center gap-3">
								<div className="flex gap-2 items-center">
									<div className="flex gap-1">
										{player?.effects?.map((effect: any, i: number) => (
											<EffectIcon
												effect={effect.type}
												key={`${effect.type}-${i}`}
											/>
										))}
									</div>
									<p className="text-xs">LV.{player.stats.LEVEL}</p>
									<p>{player.name}</p>
									<span className="px-1">•</span>
								</div>
							</div>
							<div className="pr-5 flex flex-col items-end w-32">
								<p className="-my-[1px] text-xs">
									<span>
										<span className="text-xs">HP</span>{" "}
										{Math.ceil(player.battleStats.HP)}
									</span>{" "}
									/ {player.stats.HP}
								</p>
								<div
									className="bg-green-500 h-[0.35rem] w-full transition-all"
									style={{
										width: `${Math.floor(
											(player.battleStats.HP / player.stats.HP) * 100
										)}%`,
									}}
								></div>
							</div>
						</div>
					))}
			</div>
		</div>
	);
};
export default DigitalWorldHUD;
