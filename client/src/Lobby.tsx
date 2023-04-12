import { useAtom } from "jotai";
import { roomIdAtom } from "./lib/atoms";
import { useEffect, useState } from "react";

import geckos from "@geckos.io/client";
import Chat from "./lib/components/chat/Chat";

const testLobbies = [
	{ id: "test1", name: "A dummy lobby name :)", joined: 1 },
	{ id: "test2", name: "OraOraORa", joined: 1 },
];

function Lobby() {
	const [lobbyId, setLobbyId] = useAtom(roomIdAtom);
	const [lobbyState, setLobbyState] = useState("menu");

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		const channel = geckos({ port: 3000 });
		window.channel = channel;

		channel.onConnect((error: any) => {
			if (error) return console.error(error.message);

			channel.on("lobby-joined", (data: any) => {
				setLobbyId(data);
				console.log(`You joined the room ${data}`);
			});

			channel.emit("lobby-join", { roomId: "test-room" });
		});
	}, []);

	const createLobby = (event: any) => {
		event.preventDefault();
		console.log(event);
	};
	const joinLobby = (id: string) => {
		console.log(id);
	};

	return (
		<main className="flex flex-col items-center w-screen">
			{lobbyState === "menu" ? (
				<div className="flex flex-col items-center gap-2 mb-6">
					<h1 className="text-6xl font-bold">Digital Descent</h1>
					<h2 className="text-2xl">Managing the Agile Realm</h2>
				</div>
			) : (
				<div
					className="cursor-pointer absolute top-12 left-12 flex flex-col items-center gap-2 mb-6 [zoom:0.5]"
					onClick={() => setLobbyState("menu")}
				>
					<h1 className="text-6xl font-bold">Digital Descent</h1>
					<h2 className="text-2xl">Managing the Agile Realm</h2>
				</div>
			)}
			{lobbyState === "menu" ? (
				<div className="flex flex-col w-full max-w-xl gap-2">
					<button className="w-full" onClick={() => setLobbyState("play")}>
						Play
					</button>
					<br />
					<button className="w-full" onClick={() => setLobbyState("login")}>
						Login
					</button>
					<button className="w-full" onClick={() => setLobbyState("highscore")}>
						Highscore
					</button>
					<button className="w-full" onClick={() => setLobbyState("options")}>
						Options
					</button>
					<button className="w-full" onClick={() => setLobbyState("credits")}>
						Credits
					</button>
				</div>
			) : (
				<></>
			)}

			{lobbyState === "play" ? (
				<div className="flex flex-col w-full max-w-xl gap-2">
					<form onSubmit={createLobby} className="flex gap-2">
						<input
							type="text"
							placeholder="Lobby name..."
							className="w-full rounded-md border-0 px-5 py-2 bg-[#1a1a1a] cursor-pointer transition-all"
						/>
						<button className="w-5/12">Host game</button>
					</form>
					<span className="text-[#a6a6a6] m-2 text-center text-xs">• • •</span>
					<div className="flex flex-col gap-2 h-72 bg-[rgba(255,255,255,0.05)] p-2 rounded-lg overflow-auto">
						{testLobbies.map((l) => (
							<button
								className="w-full flex justify-between"
								onClick={() => joinLobby(l.id)}
								key={l.id}
							>
								<span>{l.name}</span>
								<span>
									<span className="mr-4 text-xs text-[#a6a6a6]"> • </span>
									<span>{l.joined} / 6</span>
								</span>
							</button>
						))}
					</div>
				</div>
			) : (
				<></>
			)}
			{/* <Chat channel={window.channel} /> */}
		</main>
	);
}

export default Lobby;
