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

const ShopScreen = () => {
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

	const toggleShop = () => {
		if (scene?.shop?.display) {
			scene.shop.display = false;
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.shop?.display ? "opacity-1" : "pointer-events-none opacity-0"
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
						Shop
					</h1>
					<div className="absolute right-4 top-4 ">
						<button
							className={`bg-gray-900 text-xl py-3 px-5 rounded-t-none rounded-r-none text-center transition-all duration-500`}
							onClick={() => toggleShop()}
						>
							×
						</button>
					</div>
					<div className="absolute left-10 top-8">
						<button
							className={`bg-gray-700 text-sm py-[0.70rem] px-5 rounded-md text-center transition-all duration-500`}
							onClick={() => toggleShop()}
						>
							123 Workcredits
						</button>
					</div>
					<div className="flex gap-3 pl-2 h-full">
						<div className="flex flex-col bg-gray-700 rounded-md w-full">
							<div className="text-sm bg-slate-600 rounded-md rounded-bl-none px-3 w-4/12 text-center">
								Workshop
							</div>
							<div className="bg-gray-500 m-3 h-[20.75rem] overflow-y-scroll rounded-md gap-3 p-2">
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
							</div>
						</div>
						<div className="flex flex-col w-full h-full gap-3">
							<div className="bg-gray-700 rounded-md w-full h-36">
								<div className="text-sm bg-slate-600 rounded-md rounded-bl-none px-3 w-4/12 text-center">
									Equipment
								</div>
								<div className="flex justify-between m-3 h-[calc(100%-2.75rem)] rounded-md">
									<div className="flex w-full gap-2 items-end">
										<div className="bg-slate-800 w-12 h-12 rounded-md"></div>
										<div className="bg-slate-800 w-12 h-12 rounded-md"></div>
										<div className="bg-slate-800 w-12 h-12 rounded-md"></div>
									</div>
									{/* Drink slots */}
									<div className="flex w-full gap-2 justify-end items-end">
										<div className="bg-slate-800 w-12 h-12 rounded-md"></div>
										<div className="bg-slate-800 w-12 h-12 rounded-md"></div>
									</div>
								</div>
							</div>
							<div className="bg-gray-700 rounded-md w-full">
								<div className="text-sm bg-slate-600 rounded-md rounded-bl-none px-3 w-4/12 text-center">
									Inventory
								</div>
								<div className="bg-gray-500 m-3 h-[11rem] overflow-y-scroll rounded-md gap-3 p-2">
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
									<div className="bg-slate-800 w-full h-12 rounded-md mb-2 last:mb-0"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ShopScreen;
