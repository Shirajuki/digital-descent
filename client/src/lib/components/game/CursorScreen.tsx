import { useAtom } from "jotai";
import { engineAtom, cursorAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import BattleScene from "../../scenes/battle";
import Scene from "../../scenes/scene";
import { CURSOR_COLORS } from "../../constants";

const CursorScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [cursors, setCursors] = useAtom(cursorAtom);
	const [cursor, setCursor] = useState({ x: 0, y: 0 });

	const handleMouseMove = useCallback(
		(event: any) => {
			const channel = window.channel;
			const ox =
				document.querySelector("canvas")?.getBoundingClientRect().left || 0;
			const oy =
				document.querySelector("canvas")?.getBoundingClientRect().top || 0;
			channel?.emit("mouse-move", {
				x: event.clientX - ox,
				y: event.clientY - oy,
				scaling: scaling,
			});
			setCursor({ x: event.clientX - ox, y: event.clientY - oy });
		},
		[setCursor, scaling]
	);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const channel = window.channel;
	if (channel && !channel.cursorLoaded) {
		channel.cursorLoaded = true;
		channel.on("mouse-move", (data: any) => {
			setCursors(data.cursors);
		});
	}

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [handleMouseMove]);

	const scene: any = engine?.game.scene.getScene(
		engine.game.currentScene
	) as Scene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as BattleScene
	)?.player;

	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute pointer-events-none top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] rounded-md overflow-hidden flex justify-center items-center transition-all ${
				(scene.taskboard?.display ||
					scene.portal?.display ||
					scene.shop?.display) &&
				!scene.dialogue?.display
					? "opacity-1"
					: "opacity-0"
			}`}
		>
			{Object.values(cursors).map((cur: any, index: number) => {
				if (cur.id === player.id)
					return (
						<div
							key={"cursor" + cur.id}
							className={`absolute left-0 top-0 z-50 bg-transparent select-none font-bold rounded-full border-opacity-90 ${
								CURSOR_COLORS[index % CURSOR_COLORS.length]
							}`}
							style={{
								top: cursor.y - 25 * scaling,
								left: cursor.x - 25 * scaling,
								borderWidth: 6 * scaling,
								width: 50 * scaling,
								height: 50 * scaling,
							}}
						></div>
					);
				return (
					<div
						key={"cursor" + cur.id}
						className={`absolute left-0 top-0 z-50 bg-transparent select-none font-bold rounded-full border-opacity-90 ${
							CURSOR_COLORS[index % CURSOR_COLORS.length]
						}`}
						style={{
							top: (cur.y / cur.scaling) * scaling - 25 * scaling,
							left: (cur.x / cur.scaling) * scaling - 25 * scaling,
							borderWidth: 6 * scaling,
							width: 50 * scaling,
							height: 50 * scaling,
						}}
					></div>
				);
			})}
		</div>
	);
};
export default CursorScreen;
