import { useAtom } from "jotai";
import { roomIdAtom } from "./lib/atoms";
import { useCallback, useEffect, useState } from "react";
import Chat from "./lib/components/chat/Chat";
import { useNavigate } from "react-router-dom";
import { CURSOR_COLORS, NAMES } from "./lib/constants";

type LobbyPlayersType = {
	id: string;
	name: string;
	customization: any;
	ready: boolean;
};

function Lobby() {
	const [lobbyId, _setLobbyId] = useAtom(roomIdAtom);
	const [players, setPlayers] = useState<LobbyPlayersType[]>([]);
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

		const channel = window.channel;
		if (channel) {
			console.log(channel.id, lobbyId, (window as any).lobbyInitialized);
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
				window.playerIndex = players.findIndex((p) => p.id === channel.id);
				window.playerName = NAMES[window.playerIndex];
				console.log(window.playerIndex, window.playerName);
				navigate("/game");
			});

			if (!(window as any)?.lobbyInitialized) {
				(window as any).lobbyInitialized = true;
				const player = {
					id: channel.id,
					name: NAMES[Math.max(0, players.length)] || "Player",
					customization: {},
					ready: false,
					host: false,
				};
				setPlayer(player);
				channel.emit("lobby-update", { player });
			}
		}
		if (!lobbyId) navigate("/");
		return () => {
			if (channel) {
				channel.off("lobby-update");
				channel.off("lobby-startgame");
			}
		};
	}, [navigate, setPlayer, players]);

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
		window?.channel?.emit("lobby-startgame", {});
		console.log("start game");
	}, []);

	return (
		<main className="flex flex-col items-center w-screen">
			{/* <div className="flex w-full max-w-5xl gap-4 p-2">{lobbyId}</div> */}
			<div className="flex w-full max-w-5xl gap-4">
				<div className="w-8/12">
					<div className="grid grid-cols-4 gap-3 mb-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-md">
						{players?.map((player, i) => (
							<div
								key={player.id}
								className={`bg-slate-200 bg-opacity-0 h-48 rounded-sm flex flex-col gap justify-between items-center ${
									player.id == window?.channel?.id
										? `border-stone-100 !border-opacity-60 border-4 bg-opacity-0 ${
												CURSOR_COLORS[i % CURSOR_COLORS.length]
										  }`
										: `border-4 !border-opacity-[0.15] ${
												CURSOR_COLORS[i % CURSOR_COLORS.length]
										  }`
								}`}
							>
								<div className="bg-[rgba(255,255,255,0.05)] m-2 [width:calc(100%-1rem)] h-full text-center rounded-sm">
									<div className="mt-3 mb-1">{NAMES[i] || player.name}</div>
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
							{/* <p className="text-center">Observers</p> */}
						</div>
					</div>
				</div>
				<div className="flex flex-col w-4/12 justify-between gap-4">
					<div className="bg-[rgba(255,255,255,0.05)] p-4 h-full">
						{/* <div className="bg-slate-200 bg-opacity-10 h-72 p-2">
							<p className="text-center">Customization</p>
						</div> */}
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
