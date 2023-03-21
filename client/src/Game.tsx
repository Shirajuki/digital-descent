import { atom, useAtom } from "jotai";
import { lobbyIdAtom } from "./lib/atoms";

import { useEffect, useRef, useState } from "react";
import PhaserEngine from "./lib/engine";

function Game() {
	// Retrieve lobby id
	const [lobbyId, setLobbyId] = useAtom(lobbyIdAtom);
	const [engine, setEngine] = useState<PhaserEngine>();
	const canvasRef = useRef(null);

	// Load game engine
	useEffect(() => {
		if (!engine && canvasRef.current) {
			const nengine = new PhaserEngine(canvasRef.current);
			nengine.init();
			nengine.render();
			setEngine(nengine);
		}
	}, [engine, canvasRef]);

	return (
		<div className="App">
			<main>
				<canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
			</main>
		</div>
	);
}

export default Game;
