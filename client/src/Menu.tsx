import { useAtom } from "jotai";
import { roomIdAtom } from "./lib/atoms";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

type LobbyType = {
	id: string;
	name: string;
	joined: string[];
};

function Menu() {
	const [_lobbyId, setLobbyId] = useAtom(roomIdAtom);
	const [lobbyState, setLobbyState] = useState("menu");
	const [lobbies, setLobbies] = useState<LobbyType[]>();
	const [channel, setChannel] = useState<any>();
	const navigate = useNavigate();

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		if (!navigate || !setLobbyId || !setChannel || !setLobbyId) return;
		if (window.channel) return;
		// const channel = io(`http://${window.location.hostname}:3000`);
		const channel = io("https://digital-descent.onrender.com");
		window.channel = channel;
		setChannel(channel);
		channel.on("lobby-joined", (data: any) => {
			setLobbyId(data.roomId);
			if (window.playerIndex === undefined) window.playerIndex = data.id;
			console.log(`You joined the room ${data.roomId} as index ${data.id}`);
			navigate("/lobby");
		});
		channel.on("lobby-listing", (data: any) => {
			console.log(data);
			setLobbies(data);
		});
	}, [navigate, setChannel, setLobbyId, setLobbies]);

	const joinLobby = useCallback(
		(id: string) => {
			channel?.emit("lobby-join", { roomId: id });
		},
		[channel]
	);

	const createLobby = useCallback(
		(event: any) => {
			window.sfx.btnClick.play();
			event.preventDefault();
			const roomName = event.target.lobbyId.value;
			channel?.emit("lobby-create", {
				roomId: "" + Math.floor(Math.random() * 10 ** 10),
				name: roomName,
			});
		},
		[channel]
	);

	return (
		<main className="flex flex-col items-center w-screen">
			{lobbyState === "menu" ? (
				<div className="flex flex-col items-center gap-2 mb-8">
					<h1 className="text-6xl font-bold">Digital Descent</h1>
					<h2 className="text-2xl">Managing the Agile Realm</h2>
				</div>
			) : (
				<div
					className="cursor-pointer absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 mb-6 [zoom:0.5]"
					onClick={() => {
						setLobbyState("menu");
					}}
				>
					<h1 className="text-6xl font-bold">Digital Descent</h1>
					<h2 className="text-2xl">Managing the Agile Realm</h2>
				</div>
			)}
			{lobbyState === "menu" ? (
				<div className="flex flex-col w-full max-w-xl gap-2">
					<button
						className="w-full"
						onClick={() => {
							window.sfx.btnClick.play();
							setLobbyState("play");
						}}
					>
						Play
					</button>
					<span className="text-[#a6a6a6] m-2 text-center text-xs">• • •</span>
					{/* <button className="w-full" onClick={() => setLobbyState("login")}>
						Login
					</button> */}
					{/* <button
						className="w-full"
						onClick={() => {
							setLobbyState("highscore");
							window.sfx.btnClick.play();
						}}
					>
						Highscore
					</button> */}
					{/* <button className="w-full" onClick={() => setLobbyState("options")}>
						Options
					</button> */}
					<button
						className="w-full"
						onClick={() => {
							setLobbyState("credits");
							window.sfx.btnClick.play();
						}}
					>
						Credits
					</button>
				</div>
			) : (
				<></>
			)}

			{lobbyState === "play" ? (
				<div className="flex flex-col w-full max-w-xl gap-2">
					<p>Create a lobby:</p>
					<form onSubmit={createLobby} className="flex gap-2">
						<input
							type="text"
							autoComplete="off"
							placeholder="Lobby name..."
							name="lobbyId"
							id="lobbyId"
							className="w-full rounded-md border-0 px-5 py-2 bg-[#1a1a1a] cursor-pointer transition-all"
						/>
						<button className="w-5/12">Host game</button>
					</form>
					<span className="text-[#a6a6a6] m-2 text-center text-xs">• • •</span>
					<div className="relative flex flex-col gap-2 h-72 bg-[rgba(255,255,255,0.05)] p-2 rounded-lg overflow-auto">
						{lobbies && lobbies.length > 0 ? (
							lobbies.map((l) => (
								<button
									className="w-full flex justify-between"
									onClick={() => {
										joinLobby(l.id);
										window.sfx.btnClick.play();
									}}
									key={l.id}
								>
									<span>{l.name}</span>
									<span>
										<span className="mr-4 text-xs text-[#a6a6a6]"> • </span>
										<span>{l.joined.length} / 8</span>
									</span>
								</button>
							))
						) : (
							<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
								no lobbies found...
							</p>
						)}
					</div>
				</div>
			) : (
				<></>
			)}

			{lobbyState === "credits" ? (
				<p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xl">
					Master's Project 2023 | Digital Descent | Managing the Agile Realm
				</p>
			) : (
				<></>
			)}

			{lobbyState !== "menu" ? (
				<button
					className="absolute top-5 left-5"
					onClick={() => {
						setLobbyState("menu");
						window.sfx.btnClick.play();
					}}
				>
					← Back
				</button>
			) : (
				<></>
			)}
		</main>
	);
}

export default Menu;
