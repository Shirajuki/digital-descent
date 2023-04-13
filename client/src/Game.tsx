import { useAtom } from "jotai";
import { engineAtom, roomIdAtom } from "./lib/atoms";
import { useEffect, useRef } from "react";
import PhaserEngine from "./lib/engine";
import geckos from "@geckos.io/client";
import Chat from "./lib/components/chat/Chat";
import HUD from "./lib/components/game/HUD";
import Scene from "./lib/scenes/scene";

function Game() {
	// Retrieve lobby id
	const [_roomId, setRoomId] = useAtom(roomIdAtom);
	const [engine, setEngine] = useAtom(engineAtom);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Load game engine
	useEffect(() => {
		if (canvasRef.current && !window.engine) {
			const nengine = new PhaserEngine(canvasRef.current);
			nengine.init();
			nengine.render();
			setEngine(nengine);
			window.engine = nengine;
		}
	}, [setEngine]);

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		if (!engine || !setRoomId) return;

		// Do not reinitialize gecko if sent from lobby
		let channel: any;
		if ((window as any).lobbyInitialized) {
			channel = window.channel;
		} else {
			// Initialize gecko from scratch, for testing purposes
			// TODO: at some point remove this when done with dev
			channel = geckos({ port: 3000 });
			window.channel = channel;
			channel.onConnect((_error: any) => {
				channel.on("lobby-joined", (data: any) => {
					setRoomId(data);
					console.log(`You joined the room ${data}`);
				});
				channel.emit("lobby-join", { roomId: "test-room" });
			});
		}

		// Game syncing
		channel.on("game-update", (data: any) => {
			if (
				engine.game.currentScene === "exploration" ||
				engine.game.currentScene === "digitalworld"
			) {
				(engine.game.scene.getScene(engine.game.currentScene) as Scene).sync(
					data
				);
			}
		});

		// Exploration syncing
		channel.on("exploration-initialize", (data: any) => {
			if (engine.game.currentScene === "exploration") {
				(engine.game.scene.getScene(engine.game.currentScene) as Scene).sync(
					data
				);
			}
		});

		// Battle syncing
		channel.on("battle", (data: any) => {
			if (engine.game.currentScene === "battle") {
				(engine.game.scene.getScene(engine.game.currentScene) as Scene).sync(
					data
				);
			}
		});
	}, [engine, setRoomId]);

	return (
		<main>
			<div className="max-w-[90vw] min-w-[90vw] relative">
				<canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
				<HUD engine={engine} />
				<Chat
					channel={window.channel}
					wrapperClassName="absolute bottom-2 left-2"
				/>
			</div>
		</main>
	);
}

export default Game;
