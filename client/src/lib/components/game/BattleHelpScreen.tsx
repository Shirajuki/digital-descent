import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const BattleHelpScreen = () => {
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

	const scene: BattleScene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as BattleScene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as BattleScene
	)?.player;

	const toggleHelp = () => {
		if (scene?.help?.display) {
			window.sfx.closePopup.play();
			scene.help.display = false;
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.help?.display ? "opacity-1" : "pointer-events-none opacity-0"
			}`}
			style={{ zoom: scaling }}
		>
			{/* Info modal */}
			<div
				className="absolute bg-slate-900 w-[calc(100%-8rem)] h-[calc(100%-3rem)] [user-select:none] flex gap-4 rounded-md p-4"
				ref={infoPopup}
			>
				<div className="bg-slate-800 w-full flex flex-col gap-1 p-4">
					<h1 className="block w-full text-center text-3xl pb-2 [font-family:var(--font-normal)]">
						Help
					</h1>
					<div className="absolute right-4 top-4 ">
						<button
							className={`bg-gray-900 text-xl py-3 px-5 rounded-t-none rounded-r-none text-center transition-all duration-500`}
							onClick={() => toggleHelp()}
						>
							×
						</button>
					</div>

					<div className="flex gap-3 pl-2 h-full">
						{/* Skills */}
						<div className="flex flex-col gap-12 pl-4">
							<div className="flex gap-10">
								<div className="flex flex-col relative">
									<div
										className={`flex justify-center items-center rotate-45 w-[4.2rem] h-[4.2rem] bg-slate-500 text-[0px] transition-all rounded-md
						`}
										title={`${player?.skills?.normal?.name} (${player?.skills?.normal?.chargeCost} energy)`}
									>
										<img
											className="-rotate-45 w-10/12"
											src={`/${player?.skills?.normal?.icon}`}
											alt="normal attack icon"
										/>
									</div>
								</div>
								<div className="flex flex-col gap-2 w-full pr-3 [font-family:var(--font-normal)]">
									<div className="flex justify-between">
										<p className="p-0 underline underline-offset-4">
											{player?.skills?.normal?.name} (costs{" "}
											{player?.skills?.normal?.chargeCost} energy)
										</p>
										<div className="flex gap-2">
											<p>[{player?.skills?.normal?.icons?.join(", ")}]</p>
											<p>Targets: {player?.skills?.normal?.targets?.type}</p>
										</div>
									</div>
									<p className="text-sm">
										{player?.skills?.normal?.description}
									</p>
								</div>
							</div>
							<div className="flex gap-10">
								<div className="flex flex-col relative">
									<div
										className={`flex justify-center items-center rotate-45 w-[4.2rem] h-[4.2rem] bg-slate-500 text-[0px] transition-all rounded-md
						`}
										title={`${player?.skills?.charge?.name} (${player?.skills?.charge?.chargeCost} energy)`}
									>
										<img
											className="-rotate-45 w-10/12"
											src={`/${player?.skills?.charge?.icon}`}
											alt="charge attack icon"
										/>
									</div>
								</div>
								<div className="flex flex-col gap-2 w-full pr-3 [font-family:var(--font-normal)]">
									<div className="flex justify-between">
										<p className="p-0 underline underline-offset-4">
											{player?.skills?.charge?.name} (costs{" "}
											{player?.skills?.charge?.chargeCost} energy)
										</p>
										<div className="flex gap-2">
											<p>[{player?.skills?.charge?.icons?.join(", ")}]</p>
											<p>Targets: {player?.skills?.charge?.targets?.type}</p>
										</div>
									</div>
									<p className="text-sm">
										{player?.skills?.charge?.description}
									</p>
								</div>
							</div>
							<div className="flex gap-10">
								<div className="flex flex-col relative">
									<div
										className={`flex justify-center items-center rotate-45 w-[4.2rem] h-[4.2rem] bg-slate-500 text-[0px] transition-all rounded-md
						`}
										title={`${player?.skills?.special?.name} (${player?.skills?.special?.chargeCost} energy)`}
									>
										<img
											className="-rotate-45 w-10/12"
											src={`/${player?.skills?.special?.icon}`}
											alt="special attack icon"
										/>
									</div>
								</div>
								<div className="flex flex-col gap-2 w-full pr-3 [font-family:var(--font-normal)]">
									<div className="flex justify-between">
										<p className="p-0 underline underline-offset-4">
											{player?.skills?.special?.name} (costs{" "}
											{player?.skills?.special?.chargeCost} energy)
										</p>
										<div className="flex gap-2">
											<p>[{player?.skills?.special?.icons?.join(", ")}]</p>
											<p>Targets: {player?.skills?.special?.targets?.type}</p>
										</div>
									</div>
									<p className="text-sm">
										{player?.skills?.special?.description}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default BattleHelpScreen;
