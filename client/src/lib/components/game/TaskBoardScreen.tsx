import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import DigitalWorldScene from "../../scenes/digitalworld";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const TaskBoardScreen = () => {
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

	const scene: DigitalWorldScene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as DigitalWorldScene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as DigitalWorldScene
	)?.player;

	const toggleTaskboard = () => {
		if (scene?.taskboard?.display) {
			scene.taskboard.display = false;
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.taskboard?.display
					? "opacity-1"
					: "pointer-events-none opacity-0"
			}`}
			style={{ zoom: scaling }}
		>
			{/* Info modal */}
			<div
				className="absolute bg-slate-900 w-[calc(100%-8rem)] h-[calc(100%-3rem)] [user-select:none] flex gap-4 rounded-md p-4"
				ref={infoPopup}
			>
				<div className="bg-slate-800 w-full flex flex-col gap-4 p-4">
					<h1 className="block w-full text-center text-3xl pb-2 [font-family:var(--font-normal)]">
						Taskboard
					</h1>
					<div className="absolute right-4 top-4 ">
						<button
							className={`bg-gray-900 text-xl py-3 px-5 rounded-t-none rounded-r-none text-center transition-all duration-500`}
							onClick={() => toggleTaskboard()}
						>
							×
						</button>
					</div>
					<div className="flex gap-3 pl-2 h-full">
						<div className="bg-gray-800 border-slate-900 border-2 h-full w-full rounded-md">
							<h2 className="text-center text-md py-1 bg-zinc-900 mb-3">
								Backlog (5)
							</h2>
							<div className="w-full gap-[1.75rem] h-[calc(100%-3.5rem)] overflow-auto rounded-md flex flex-col items-center">
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gray-800 border-slate-900 border-2 h-full w-full rounded-md">
							<h2 className="text-center text-md py-1 bg-zinc-900 mb-3">
								Current (1)
							</h2>
							<div className="w-full gap-[1.75rem] min-h-[calc(13.50%-3rem)] rounded-md flex flex-col items-center">
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gray-800 border-slate-900 border-2 h-full w-full rounded-md">
							<h2 className="text-center text-md py-1 bg-zinc-900 mb-3">
								Finished (1)
							</h2>
							<div className="w-full gap-[1.75rem] min-h-[calc(13.50%-3rem)] rounded-md flex flex-col items-center">
								<div className="flex bg-slate-700 w-11/12 px-2 py-2 relative rounded-t-md rounded-l-md">
									<input
										className="pointer-events-none"
										type="checkbox"
										checked
										readOnly
									/>
									<p className="ml-2">Collect X amount EXP</p>
									<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
										<p>5 energy</p>
										<p>64 EXP, 123 Gold</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default TaskBoardScreen;
