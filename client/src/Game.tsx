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
				channel.emit("lobby-join", { roomId: "test-room" }, { reliable: true });
			});
		}

		// Game syncing
		channel.on("game-update", (data: any) => {
			(engine.game.scene.getScene(engine.game.currentScene) as Scene).sync(
				data
			);
		});
		// Leveling syncing
		channel.on("dialogue", (data: any) => {
			const scene = engine.game.scene.getScene(
				engine.game.currentScene
			) as Scene;
			if (scene.dialogue.scenario !== data.scenarion) {
				scene.dialogue.scenario = data.scenario;
				scene.dialogue.texts = [...scene.dialogue.texts, ...data.texts];
				scene.player.movement = {
					left: false,
					up: false,
					right: false,
					down: false,
				};
			}
			scene.dialogueSync();
		});
		channel.on("dialogue-end", () => {
			const scene = engine.game.scene.getScene(
				engine.game.currentScene
			) as Scene;
			scene.dialogue.display = false;
			scene.dialogue.texts = [];
			scene.dialogueSync();

			// Do dialogue action if exists
			if (scene.dialogue.action !== "") {
				scene.triggerAction(scene.dialogue.action);
			}
		});
		channel.on("action", (data: any) => {
			const scene = engine.game.scene.getScene(
				engine.game.currentScene
			) as Scene;
			console.log(data);
			if (data?.scenario) {
				scene.triggerAction(data.scenario);
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
		// Leveling syncing
		channel.on("leveling", (data: any) => {
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
					scale={true}
				/>
			</div>
		</main>
	);
}

export default Game;
