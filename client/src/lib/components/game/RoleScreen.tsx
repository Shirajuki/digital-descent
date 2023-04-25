import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import DigitalWorldScene from "../../scenes/digitalworld";
import OfficeScene from "../../scenes/office";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const RoleScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [infoPopup] = useAutoAnimate();
	const [role, setRole] = useState("");
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const scene: OfficeScene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as OfficeScene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as OfficeScene
	)?.player;

	const toggleReady = () => {
		const channel = window.channel;
		if (channel) {
			scene.role.ready = !scene.role.ready;
			window.playerBattleClass = role;
			if (scene.role.ready) {
				channel.emit("action-ready", {
					id: player.id,
					scenario: "END_ROLE_SELECTION",
					ready: true,
				});
			} else {
				channel.emit("action-ready", {
					id: player.id,
					scenario: "END_ROLE_SELECTION",
					ready: false,
				});
			}
			forceUpdate();
		}
	};

	const toggleRole = () => {
		if (scene?.role?.display) {
			scene.role.display = false;
		}
		forceUpdate();
	};

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.role?.display ? "opacity-1" : "pointer-events-none opacity-0"
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
						Role selection
					</h1>
					<div className="flex flex-col h-full py-10">
						<div className="flex gap-4">
							<button
								className={`w-full ${
									role === "tank"
										? "!bg-zinc-900 outline-offset-4 outline-1 outline"
										: ""
								}`}
								onClick={() => setRole("tank")}
							>
								<h3 className="text-2xl font-bold mb-2">The Architect</h3>
								<p>
									responsible for designing and building the foundational
									systems that support the rest of the IT infrastructure.
								</p>
							</button>
							<button
								className={`w-full ${
									role === "support"
										? "!bg-zinc-900 outline-offset-4 outline-1 outline"
										: ""
								}`}
								onClick={() => setRole("support")}
							>
								<h3 className="text-2xl font-bold mb-2">The Tester</h3>
								<p>
									responsible for ensuring that the systems and applications are
									functioning properly and addressing any issues that arise.
								</p>
							</button>
							<button
								className={`w-full ${
									role === "dps"
										? "!bg-zinc-900 outline-offset-4 outline-1 outline"
										: ""
								}`}
								onClick={() => setRole("dps")}
							>
								<h3 className="text-2xl font-bold mb-2">The Developer</h3>
								<p>
									responsible for building and maintaining the applications and
									software that drive the organization forward.
								</p>
							</button>
						</div>
					</div>
					<div>
						<button
							className={`bg-gray-900 w-full text-center transition-all duration-500 ${
								scene?.role?.ready ? "!bg-green-700 !bg-opacity-70" : ""
							} ${role === "" ? "opacity-50 cursor-not-allowed" : ""}`}
							onClick={() => toggleReady()}
						>
							{scene?.role?.ready ? "toggle ready" : "ready"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default RoleScreen;
