import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import autoAnimate from "@formkit/auto-animate";
import BattleScene from "../../scenes/battle";
import BattleSystem from "../../rpg/systems/battleSystem";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const BattleHUD = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [turnIndicator] = useAutoAnimate();
	const [chargeIndicator] = useAutoAnimate();
	const [textPopup] = useAutoAnimate();

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

	const normalAttack = useCallback(() => {
		battle?.doAttack("normal", player.id);
	}, [battle]);
	const chargeAttack = useCallback(() => {
		battle?.doAttack("charge", player.id);
	}, [battle]);
	const specialAttack = useCallback(() => {
		battle?.doAttack("special", player.id);
	}, [battle]);

	const healthPotion = useCallback(() => {
		console.log("health potion");
	}, [battle]);
	const staminaPotion = useCallback(() => {
		console.log("stamina potion");
	}, [battle]);

	const toggleAttackInfo = useCallback(() => {
		console.log("toggle attack info");
	}, [battle]);

	if (!player || !player?.stats || !player?.battleStats || !battle)
		return <></>;

	return (
		<div
			className="absolute top-0 left-0 z-10 w-full h-full [font-family:var(--font-hud)]"
			style={{ zoom: scaling }}
		>
			{/* Battle turn indicator */}
			<div
				ref={turnIndicator}
				className="absolute top-5 left-5 flex flex-col gap-2 w-24 [user-select:none]"
			>
				{battle.turnQueue.map((turn, i) => (
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
				{battle.players
					?.filter((player) => player.stats && player.battleStats)
					.map((player, i) => (
						<div
							className="relative flex flex-col items-end transition-all"
							style={{
								paddingRight: battle.turnQueue[0]?.id === player.id ? 20 : 0,
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
										width: Math.floor(
											(player.battleStats.HP / player.stats.HP) * 100
										),
									}}
								></div>
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
										width: Math.floor(
											(player.battleStats.SP / player.stats.SP) * 100
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
					<p className="text-2xl">{player.battleStats.CHARGE}</p>
					<span className="opacity-80">/</span>
				</div>
				<div
					ref={chargeIndicator}
					className="flex gap-1 h-[1.75rem] items-center justify-center"
				>
					{new Array(player.battleStats.CHARGE).fill(0).map((_, i) => (
						<p
							key={"filledCharge" + i}
							className="!rotate-12 bg-slate-500 w-[0.6rem] h-[1.75rem] rounded-md"
						></p>
					))}
					{new Array(player.battleStats.MAXCHARGE - player.battleStats.CHARGE)
						.fill(0)
						.map((_, i) => (
							<p
								key={"emptyCharge" + i}
								className="!rotate-12 bg-slate-800 w-[0.6rem] h-[1.75rem] rounded-md"
							></p>
						))}
				</div>
			</div>

			{/* Button Groups for Items and Attacks */}
			<div className="absolute right-5 bottom-5 w-4/12 h-2/6 text-right">
				<div className="relative w-full h-full">
					<button
						className={`rotate-45 w-8 h-8 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[2.75rem] right-[11.5rem]
						${
							battle.turnQueue[0]?.id !== player.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						onClick={() => healthPotion()}
						title="Health Potion"
					></button>
					<button
						className={`rotate-45 w-8 h-8 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[1rem] right-[9.75rem]
						${
							battle.turnQueue[0]?.id !== player.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						onClick={() => staminaPotion()}
						title="Stamina Potion"
					></button>

					<button
						className={`flex justify-center items-center rotate-45 w-16 h-16 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[3.75rem] right-[0.75rem]
						${
							player?.skills?.special?.targets?.type === "monster" &&
							battle?.state?.target?.type !== "monster"
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						${
							player?.skills?.special?.targets?.type === "player" &&
							battle?.state?.target?.type === "monster" &&
							player?.skills?.special?.targets?.amount === "single"
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						${
							player.battleStats.CHARGE < player?.skills?.special?.chargeCost ||
							battle.turnQueue[0]?.id !== player.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						`}
						onClick={() => specialAttack()}
						title={`${player?.skills?.special?.name} (${player?.skills?.special?.chargeCost} energy)`}
					>
						<img
							className="-rotate-45 w-10/12"
							src={`http://localhost:5173/${player?.skills?.special?.icon}`}
							alt="special attack icon"
						/>
					</button>
					<button
						className={`flex justify-center items-center rotate-45 w-16 h-16 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-2 right-[4rem]
						${
							player?.skills?.charge?.targets?.type === "monster" &&
							battle?.state?.target?.type !== "monster"
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						${
							player?.skills?.charge?.targets?.type === "player" &&
							battle?.state?.target?.type === "monster" &&
							player?.skills?.charge?.targets?.amount === "single"
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						${
							player.battleStats.CHARGE < player?.skills?.charge?.chargeCost ||
							battle.turnQueue[0]?.id !== player.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						onClick={() => chargeAttack()}
						title={`${player?.skills?.charge?.name} (${player?.skills?.charge?.chargeCost} energy)`}
					>
						<img
							className="-rotate-45 w-10/12"
							src={`http://localhost:5173/${player?.skills?.charge?.icon}`}
							alt="charge attack icon"
						/>
					</button>
					<button
						className={`flex justify-center items-center rotate-45 w-16 h-16 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[3.75rem] right-[7.25rem]
						${
							player?.skills?.normal?.targets?.type === "monster" &&
							battle?.state?.target?.type !== "monster"
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						${
							player?.skills?.normal?.targets?.type === "player" &&
							battle?.state?.target?.type === "monster" &&
							player?.skills?.normal?.targets?.amount === "single"
								? "opacity-50 cursor-not-allowed"
								: ""
						}
						${
							player.battleStats.CHARGE < player?.skills?.normal?.chargeCost ||
							battle.turnQueue[0]?.id !== player.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						onClick={() => normalAttack()}
						title={`${player?.skills?.normal?.name} (${player?.skills?.normal?.chargeCost} energy)`}
					>
						<img
							className="-rotate-45 w-10/12"
							src={`http://localhost:5173/${player?.skills?.normal?.icon}`}
							alt="normal attack icon"
						/>
					</button>

					<button
						className="rotate-45 w-8 h-8 bg-slate-500 text-[0px] hover:bg-slate-800 transition-all absolute bottom-[1rem] right-[0rem]"
						onClick={() => toggleAttackInfo()}
					></button>
				</div>
			</div>

			{/* Battle text popups */}
			<div
				ref={textPopup}
				className={`absolute left-1/2 -translate-x-1/2 top-5 overflow-hidden bg-slate-800 px-8 py-2 text-sm rounded-xl transition-all duration-300 ${
					battle.actionText === "" ? "opacity-0 max-w-0" : ""
				}`}
			>
				<p
					className={`opacity-1 transition-all w-auto h-5 duration-300 overflow-hidden ${
						battle.actionText === "" ? "max-w-0" : ""
					}`}
				>
					<span>{battle.actionText}</span>
				</p>
			</div>
		</div>
	);
};
export default BattleHUD;
