import { useAtom } from "jotai";
import { engineAtom, roomIdAtom } from "./lib/atoms";

import { useEffect, useRef, useState } from "react";
import PhaserEngine from "./lib/engine";
import geckos from "@geckos.io/client";

function Game() {
	// Retrieve lobby id
	const [_roomId, setRoomId] = useAtom(roomIdAtom);
	const [engine, setEngine] = useAtom(engineAtom);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Load game engine
	useEffect(() => {
		if (canvasRef.current) {
			const nengine = new PhaserEngine(canvasRef.current);
			nengine.init();
			nengine.render();
			setEngine(nengine);
		}
	}, [setEngine]);

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		if (!engine) return;

		const channel = geckos({ port: 3000 });
		window.channel = channel;

		// TODO: Create a module for saving the different channel listeners in one module
		channel.onConnect((error: any) => {
			if (error) return console.error(error.message);

			channel.on("lobby-joined", (data: any) => {
				setRoomId(data);
				console.log(`You joined the room ${data}`);
			});
			channel.on("game-update", (data: any) => {
				engine.update(data);
			});

			channel.emit("lobby-join", { roomId: "test-room" });
		});
	}, [engine, setRoomId]);

	return (
		<div className="App">
			<main>
				<canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
			</main>
		</div>
	);
}

export default Game;
