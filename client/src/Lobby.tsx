import { useAtom } from "jotai";
import { roomIdAtom } from "./lib/atoms";
import { useCallback, useEffect, useState } from "react";
import Chat from "./lib/components/chat/Chat";
import { useNavigate } from "react-router-dom";

type LobbyPlayersType = {
	id: string;
	name: string;
	customization: any;
	ready: boolean;
};

function Lobby() {
	const [lobbyId, _setLobbyId] = useAtom(roomIdAtom);
	const [players, setPlayers] = useState<LobbyPlayersType[]>();
	const [player, setPlayer] = useState({
		id: "undefined",
		name: "Player",
		customization: {},
		ready: false,
		host: false,
	});

	const navigate = useNavigate();

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		if (!navigate || !setPlayer) return;
		if ((window as any)?.lobbyInitialized) return;

		const channel = window.channel;
		if (channel) {
			(window as any).lobbyInitialized = true;
			console.log(channel.id, lobbyId);
			channel.on("lobby-update", (data: any) => {
				console.log(data);
				setPlayers(data);
				if (data.length === 1) {
					setPlayer((player) => {
						return { ...player, host: true };
					});
				}
			});
			channel.on("lobby-startgame", () => {
				console.log("starting game...");
				navigate("/game");
			});

			const player = {
				id: channel.id,
				name: "Player",
				customization: {},
				ready: false,
				host: false,
			};
			setPlayer(player);
			channel.emit("lobby-update", { player });
		}
		if (!lobbyId) navigate("/");
	}, [navigate, setPlayer]);

	const updateLobby = useCallback(
		(player: any) => {
			window?.channel?.emit("lobby-update", { player });
		},
		[player]
	);

	const toggleReady = useCallback(() => {
		const nplayer = { ...player, ready: !player.ready };
		setPlayer(nplayer);
		updateLobby(nplayer);
	}, [updateLobby, player]);

	const startGame = useCallback(() => {
		window?.channel?.emit("lobby-startgame");
		console.log("start game");
	}, []);

	return (
		<main className="flex flex-col items-center w-screen">
			<div className="flex w-full max-w-5xl gap-4">
				<div className="w-8/12">
					<div className="grid grid-cols-4 gap-3 mb-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-md">
						{players?.map((player) => (
							<div
								key={player.id}
								className={`bg-slate-200 bg-opacity-0 h-48 rounded-sm flex flex-col gap justify-between items-center ${
									player.id == window?.channel?.id
										? "border-stone-100 border-opacity-20 border-4 bg-opacity-0"
										: ""
								}`}
							>
								<div className="bg-[rgba(255,255,255,0.05)] m-2 [width:calc(100%-1rem)] h-full text-center rounded-sm">
									<div className="mt-3 mb-1">{player.name}</div>
									<div className="sprite [zoom:1.1] mx-auto"></div>
								</div>
								<div
									className={`bg-[rgba(255,255,255,0.05)] p-1 mb-2 [width:calc(100%-1rem)] text-center rounded-sm transition-all duration-500 ${
										player.ready ? "bg-green-400 bg-opacity-70" : ""
									}`}
								>
									{player.ready ? "ready" : "not ready"}
								</div>
							</div>
						))}
						{new Array(8 - (players?.length ?? 0)).fill(0).map((_, index) => (
							<div
								key={(players?.length ?? 0) + index}
								className="bg-slate-200 bg-opacity-10 h-48 rounded-sm"
							></div>
						))}
					</div>
					<div className="flex gap-4">
						<Chat
							channel={window.channel}
							wrapperClassName="!bg-[rgba(255,255,255,0.05)]"
							className="max-h-24 h-24"
						/>
						<div className="bg-[rgba(255,255,255,0.05)] w-full rounded-md p-2">
							<p className="text-center">Observers</p>
						</div>
					</div>
				</div>
				<div className="flex flex-col w-4/12 justify-between gap-4">
					<div className="bg-[rgba(255,255,255,0.05)] p-4 h-full">
						<div className="bg-slate-200 bg-opacity-10 h-72"></div>
					</div>
					{player.host && players?.every((p) => p.ready) ? (
						<button
							className={`w-full h-20 text-3xl bg-green-400 bg-opacity-50`}
							onClick={() => startGame()}
						>
							Start game
						</button>
					) : (
						<button
							className={`w-full h-20 text-3xl ${
								player.ready
									? "bg-red-400 bg-opacity-20"
									: "bg-green-400 bg-opacity-50"
							}`}
							onClick={() => toggleReady()}
						>
							{player.ready ? "not ready" : "ready"}
						</button>
					)}
				</div>
			</div>
		</main>
	);
}

export default Lobby;
