import { useAtom } from "jotai";
import { engineAtom, roomIdAtom, socketAtom } from "./lib/atoms";
import { useEffect, useRef } from "react";
import PhaserEngine from "./lib/engine";
import Chat from "./lib/components/chat/Chat";
import HUD from "./lib/components/game/HUD";
import Scene from "./lib/scenes/scene";
import { io } from "socket.io-client";

function Game() {
	// Retrieve lobby id
	const [_roomId, setRoomId] = useAtom(roomIdAtom);
	const [engine, setEngine] = useAtom(engineAtom);
	const [_socket, setSocket] = useAtom(socketAtom);
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

	// Load socketio and initialize listeners for socketio
	useEffect(() => {
		if (!engine || !setRoomId) return;

		// Do not reinitialize gecko if sent from lobby
		let channel: any;
		if ((window as any).lobbyInitialized) {
			channel = window.channel;
		} else {
			// Initialize socket from scratch, for testing purposes
			// TODO: at some point remove this when done with dev
			// channel = io(`http://${window.location.hostname}:3000`);
			channel = io("https://digital-descent.onrender.com");
			window.channel = channel;
			channel.on("lobby-joined", (data: any) => {
				setRoomId(data.roomId);
				if (window.playerIndex === undefined) window.playerIndex = data.id;
				console.log(`You joined the room ${data.roomId} as index ${data.id}`);
			});
			channel.emit("lobby-join", { roomId: "test-room" });
		}
		setSocket(channel);

		// Game syncing
		channel.on("game-update", (data: any) => {
			(engine.game.scene.getScene(engine.game.currentScene) as Scene).sync(
				data
			);
		});
		// Dialogue syncing
		channel.on("dialogue", (data: any) => {
			const scene = engine.game.scene.getScene(
				engine.game.currentScene
			) as Scene;
			if (scene.dialogue.scenario !== data.scenarion) {
				scene.dialogue.scenario = data.scenario;
				scene.dialogue.texts = [...scene.dialogue.texts, ...data.texts];
				if (scene.player) {
					scene.player.movement = {
						left: false,
						up: false,
						right: false,
						down: false,
					};
				}
			}
			scene.dialogueSync();
			scene.observable.notify();
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
		// Task syncing
		channel.on("task", (data: any) => {
			const scene = engine.game.scene.getScene(
				engine.game.currentScene
			) as Scene;

			if (data?.type === "task-initialize") {
				scene.game.data.openTasks = data?.tasks;
			} else if (data?.type === "task-update") {
				scene.game.data.openTasks = data?.openTasks;
				scene.game.data.currentTasks = data?.currentTasks;
			}

			scene.observable.notify();
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
		// Quiz syncing
		channel.on("quiz", (data: any) => {
			if (engine.game.currentScene === "exploration") {
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
					className="!max-h-24"
					wrapperClassName="absolute bottom-2 left-2"
					scale={true}
				/>
			</div>
		</main>
	);
}

export default Game;
