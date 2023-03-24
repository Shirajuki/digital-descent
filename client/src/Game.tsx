import { useAtom } from "jotai";
import { engineAtom, lobbyIdAtom } from "./lib/atoms";

import { useEffect, useRef, useState } from "react";
import PhaserEngine from "./lib/engine";
import geckos from "@geckos.io/client";

function Game() {
	// Retrieve lobby id
	const [lobbyId, setLobbyId] = useAtom(lobbyIdAtom);
	const [engine, setEngine] = useAtom(engineAtom);
	const [channel, setChannel] = useState<any>();
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

	// Load geckos channel
	useEffect(() => {
		const nchannel = geckos({ port: 3000 });
		setChannel(nchannel);
	}, []);

	// Initialize listeners for geckos
	useEffect(() => {
		if (!channel || !engine) return;

		// TODO: use a singleton object to share states between component and classes
		(window as any).channel = channel;

		channel.onConnect((error: any) => {
			if (error) return console.error(error.message);

			channel.on("joined", (data: string) => {
				setLobbyId(data);
				console.log(`You joined the room ${data}`);
			});

			channel.on("update", (data: any) => {
				engine.update(data);
			});

			channel.emit("join", { roomId: "test-room" });
		});
	}, [channel, engine, setLobbyId]);

	return (
		<div className="App">
			<main>
				<canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
			</main>
		</div>
	);
}

export default Game;
