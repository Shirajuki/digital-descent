import { atom, useAtom } from "jotai";
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

	useEffect(() => {
		const nchannel = geckos({ port: 3000 }); // default port is 9208
		setChannel(nchannel);
	}, []);

	useEffect(() => {
		if (!channel || !engine) return;

		// TODO: use a singleton object to share states between component and classes
		(window as any).channel = channel;

		channel.onConnect((error: any) => {
			if (error) {
				console.error(error.message);
				return;
			}

			channel.on("chat message", (data: any) => {
				console.log(`You got the message ${data}`);
			});

			channel.on("update", (data: any) => {
				engine.update(data);
			});

			channel.emit("chat message", "a short message sent to the server");
		});
	}, [channel, engine]);

	return (
		<div className="App">
			<main>
				<canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
			</main>
		</div>
	);
}

export default Game;
