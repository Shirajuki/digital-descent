import { useAtom } from "jotai";
import { engineAtom, lobbyIdAtom } from "./lib/atoms";

import { useEffect, useRef, useState } from "react";
import PhaserEngine from "./lib/engine";
import geckos from "@geckos.io/client";

function Game() {
	// Retrieve lobby id
	const [_lobbyId, setLobbyId] = useAtom(lobbyIdAtom);
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

		channel.onConnect((error: any) => {
			if (error) return console.error(error.message);

			channel.on("joined", (data: any) => {
				setLobbyId(data);
				console.log(`You joined the room ${data}`);
			});
			channel.on("update", (data: any) => {
				engine.update(data);
			});

			channel.emit("join", { roomId: "test-room" });
		});
	}, [engine, setLobbyId]);

	return (
		<div className="App">
			<main>
				<canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
			</main>
		</div>
	);
}

export default Game;
