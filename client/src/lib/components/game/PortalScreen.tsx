import { useAtom } from "jotai";
import { engineAtom, selectsAtom, socketAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import DigitalWorldScene from "../../scenes/digitalworld";
import { PLAYER_COLORS } from "../../constants";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const PortalScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [infoPopup] = useAutoAnimate();
	const [select, setSelect] = useState<any>(null);
	const [selects, setSelects] = useAtom(selectsAtom);
	const [socket, _setSocket] = useAtom(socketAtom);
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

	useEffect(() => {
		const channel = socket;
		if (!channel) return;

		channel.on("selects", (data: any) => {
			if (data.type === "selects-update") {
				setSelects(data.selects);
				forceUpdate();
			}
		});

		forceUpdate();

		return () => {
			channel.off("selects");
		};
	}, [socket, setSelects, forceUpdate, player]);

	useEffect(() => {
		console.log(selects);
		const sel = Object.values(selects);
		const selSet = new Set(sel);
		if (scene?.players.length === sel.length && selSet.size === 1) {
			if (selSet.has("work")) {
				togglePortal();
				scene.switch("exploration");
				setTimeout(() => scene.observable.notify(), 1000);
			} else {
				togglePortal();
			}
		}
	}, [selects]);

	const togglePortal = () => {
		if (scene?.portal?.display) {
			window.channel.emit("selects-reset", {
				id: player.id,
			});

			scene.portal.display = false;
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.portal?.display ? "opacity-1" : "pointer-events-none opacity-0"
			}`}
			style={{ zoom: scaling }}
		>
			{/* Info modal */}
			<div
				className="absolute bg-slate-900 w-[calc(100%-8rem)] h-[calc(100%-6rem)] [user-select:none] flex gap-4 rounded-md p-4"
				ref={infoPopup}
			>
				<div className="bg-slate-800 w-full flex flex-col gap-4 p-4">
					<h1 className="block w-full text-center text-3xl pb-2 [font-family:var(--font-normal)]">
						Portal
					</h1>
					<div className="absolute right-4 top-4 ">
						<button
							className={`bg-gray-900 text-xl py-3 px-5 rounded-t-none rounded-r-none text-center transition-all duration-500`}
							onClick={() => togglePortal()}
						>
							×
						</button>
					</div>
					<div className="flex flex-col gap-3 pl-2 h-full">
						<button
							className={`relative bg-gray-900 h-full text-2xl [width:calc(100%-1rem)] text-center transition-all duration-500 ${
								false ? "!bg-green-700 !bg-opacity-70" : ""
							}`}
							onClick={() => {
								window.channel.emit("selects-update", {
									id: player.id,
									select: select === "work" ? null : "work",
								});
								setSelect(select === "work" ? null : "work");
							}}
						>
							{scene?.players.map((p, i) => {
								if (selects[p?.id] !== "work")
									return <div key={"workselect" + i} className="hidden"></div>;
								return (
									<div
										key={"workselect" + i}
										className={`absolute top-0 h-5 w-5 ${
											PLAYER_COLORS[i % PLAYER_COLORS.length]
										} -translate-x-2 -translate-y-2 rotate-45`}
										style={{ left: i * 32 }}
										title={p.name}
									></div>
								);
							})}
							work
						</button>
						<button
							className={`relative bg-gray-900 h-24 text-sm [width:calc(100%-1rem)] text-center transition-all duration-500 ${
								false ? "!bg-green-700 !bg-opacity-70" : ""
							}`}
							onClick={() => {
								window.channel.emit("selects-update", {
									id: player.id,
									select: select === "delivery" ? null : "delivery",
								});
								setSelect(select === "delivery" ? null : "delivery");
								// togglePortal();
							}}
						>
							{scene?.players.map((p, i) => {
								if (selects[p?.id] !== "delivery")
									return (
										<div key={"deliveryselect" + i} className="hidden"></div>
									);
								return (
									<div
										key={"deliveryselect" + i}
										className={`absolute top-0 h-5 w-5 ${
											PLAYER_COLORS[i % PLAYER_COLORS.length]
										} -translate-x-2 -translate-y-2 rotate-45`}
										style={{ left: i * 32 }}
										title={p.name}
									></div>
								);
							})}
							delivery
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PortalScreen;
