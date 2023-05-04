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

const DaysScreen = () => {
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

	const toggleDays = () => {
		if (scene?.days?.display) {
			scene.days.display = false;
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.days?.display ? "opacity-1" : "pointer-events-none opacity-0"
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
						Calendar
					</h1>
					<div className="absolute right-4 top-4 ">
						<button
							className={`bg-gray-900 text-xl py-3 px-5 rounded-t-none rounded-r-none text-center transition-all duration-500`}
							onClick={() => toggleDays()}
						>
							×
						</button>
					</div>
					<div className="flex gap-3 pl-2 h-full">
						<div className="flex flex-col bg-gray-700 rounded-md w-full [font-family:var(--font-normal)]">
							<div className="flex justify-around items-center gap-2 m-3 h-[20.75rem] overflow-y-auto rounded-md p-2">
								<div className="relative flex justify-center items-center text-lg bg-slate-500 w-32 h-32 rounded-md">
									<p>Workday</p>
									<p className="absolute -bottom-10">
										Day {scene.game.data.displayDays + 1}
									</p>
									{scene.game.data.days === scene.game.data.displayDays + 1 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/currentDays.png"
											alt="days marker"
										/>
									) : scene.game.data.days > scene.game.data.displayDays + 1 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/finishedDays.png"
											alt="days marker"
										/>
									) : (
										<></>
									)}
								</div>
								<div className="relative flex justify-center items-center text-lg bg-slate-500 w-32 h-32 rounded-md">
									<p>Workday</p>
									<p className="absolute -bottom-10">
										Day {scene.game.data.displayDays + 2}
									</p>
									{scene.game.data.days === scene.game.data.displayDays + 2 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/currentDays.png"
											alt="days marker"
										/>
									) : scene.game.data.days > scene.game.data.displayDays + 2 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/finishedDays.png"
											alt="days marker"
										/>
									) : (
										<></>
									)}
								</div>
								<div className="relative flex justify-center items-center text-lg bg-slate-500 w-32 h-32 rounded-md">
									<p>Workday</p>
									<p className="absolute -bottom-10">
										Day {scene.game.data.displayDays + 3}
									</p>
									{scene.game.data.days === scene.game.data.displayDays + 3 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/currentDays.png"
											alt="days marker"
										/>
									) : scene.game.data.days > scene.game.data.displayDays + 3 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/finishedDays.png"
											alt="days marker"
										/>
									) : (
										<></>
									)}
								</div>
								<div className="relative flex justify-center items-center text-lg bg-slate-500 w-32 h-32 rounded-md">
									<p>Workday</p>
									<p className="absolute -bottom-10">
										Day {scene.game.data.displayDays + 4}
									</p>
									{scene.game.data.days === scene.game.data.displayDays + 4 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/currentDays.png"
											alt="days marker"
										/>
									) : scene.game.data.days > scene.game.data.displayDays + 4 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/finishedDays.png"
											alt="days marker"
										/>
									) : (
										<></>
									)}
								</div>
								<div className="relative flex justify-center items-center text-lg bg-slate-500 w-32 h-32 rounded-md">
									<p>Meeting</p>
									<p className="absolute -bottom-10">
										Day {scene.game.data.displayDays + 5}
									</p>
									{scene.game.data.days === scene.game.data.displayDays + 5 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/currentDays.png"
											alt="days marker"
										/>
									) : scene.game.data.days > scene.game.data.displayDays + 5 ? (
										<img
											className="absolute scale-[1.3] opacity-90"
											src="/sprites/finishedDays.png"
											alt="days marker"
										/>
									) : (
										<></>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default DaysScreen;
