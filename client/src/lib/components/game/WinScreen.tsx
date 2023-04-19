import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import BattleSystem from "../../rpg/systems/battleSystem";
import { ELEMENT } from "../../constants";
import EffectIcon from "./EffectIcon";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const WinScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [modalPopup] = useAutoAnimate();

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
			className="absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center"
			style={{ zoom: scaling }}
		>
			{/* Modal */}
			<div className="bg-slate-900 w-[calc(100%-8rem)] h-[calc(100%-6rem)] [user-select:none] flex gap-4 rounded-md p-4">
				<div className="bg-slate-800 w-full flex flex-col gap-4 p-4">
					<h1 className="block w-full text-center text-3xl pb-2 [font-family:var(--font-normal)]">
						Information log
					</h1>
					<div className="flex flex-col gap-3 pl-2">
						{battle.players
							?.filter((player) => player.stats && player.battleStats)
							.map((player, i) => (
								<div
									className="relative flex flex-col items-start transition-all"
									style={{
										paddingRight:
											battle.turnQueue[0]?.id === player.id ? 20 : 0,
									}}
									key={`${player.id}-${i}`}
								>
									<div className="flex items-center gap-3">
										<div className="flex gap-2 items-center">
											<div
												className={`w-4 h-4 bg-slate-500 rotate-45 text-center text-transparent rounded-sm
									${player.stats.ELEMENT === ELEMENT.FIRE && "!bg-red-400"}
									${player.stats.ELEMENT === ELEMENT.WATER && "!bg-blue-400"}
									${player.stats.ELEMENT === ELEMENT.WOOD && "!bg-green-400"}
									${player.stats.ELEMENT === ELEMENT.LIGHT && "!bg-yellow-200"}
									${player.stats.ELEMENT === ELEMENT.DARK && "!bg-indigo-500"}
									}`}
											>
												{player.stats.ELEMENT}
											</div>
											<span className="mx-[1px]">•</span>
											<p>{player.name}</p>
											<p className="text-xs">LV.{player.stats.LEVEL}</p>
											<div className="flex gap-1">
												{player?.effects?.map((effect: any, i: number) => (
													<EffectIcon
														effect={effect.type}
														key={`${effect.type}-${i}`}
													/>
												))}
											</div>
										</div>
									</div>
									<div className="flex justify-start gap-3 -my-2">
										<div className="flex flex-col items-start w-32 py-3">
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
										<div className="flex flex-col items-start w-32 py-3">
											<p className="-my-[1px] text-xs">
												<span>
													<span className="text-xs">SP</span>{" "}
													{Math.ceil(player.battleStats.SP)}
												</span>{" "}
												/ {player.stats.SP}
											</p>
											<div
												className="bg-blue-500 h-[0.35rem] w-full transition-all"
												style={{
													width: `${Math.floor(
														(player.battleStats.SP / player.stats.SP) * 100
													)}%`,
												}}
											></div>
										</div>
										<div className="flex flex-col items-start w-72 py-3">
											<p className="-my-[1px] text-xs">
												<span>
													<span className="text-xs">XP</span>{" "}
													{Math.ceil(player.stats.HP)}
												</span>{" "}
												/ {player.stats.HP}
											</p>
											<div className="bg-slate-700 h-[0.35rem] w-full transition-all">
												<div
													className="bg-amber-300 h-full w-full transition-all"
													style={{
														width: `${Math.floor(
															(player.battleStats.HP / player.stats.HP) * 100
														)}%`,
													}}
												></div>
											</div>
										</div>
									</div>
									{i >
										battle.players?.filter(
											(player) => player.stats && player.battleStats
										).length -
											1 && (
										<div className="w-full h-[2px] mt-3 border-dashed border-b-rose-50 border-b-2 border-opacity-[0.08]"></div>
									)}
								</div>
							))}
					</div>
				</div>
				<div className="bg-slate-800 w-2/6 flex flex-col gap-4 p-4">
					<h2 className="block w-full text-center text-xl [font-family:var(--font-normal)]">
						Item drop
					</h2>
					<div className="flex flex-col [font-family:var(--font-normal)] gap-2">
						<div className="bg-slate-700 rounded-sm p-2">
							Item drop <span>(× 1)</span>
						</div>
						<div className="bg-slate-700 rounded-sm p-2">
							Dummy item drop <span>(× 1)</span>
						</div>
						<div className="bg-slate-700 rounded-sm p-2">
							Dummy item droppu <span>(× 1)</span>
						</div>
						<div className="bg-slate-700 rounded-sm p-2">
							Dummy item drop <span>(× 1)</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default WinScreen;
