import { useAtom } from "jotai";
import { roomIdAtom } from "./lib/atoms";
import { useEffect, useState } from "react";
import Chat from "./lib/components/chat/Chat";

const players = [
	{ id: "player1", name: "Player 1", customization: {}, ready: false },
	{ id: "player2", name: "Player 2", customization: {}, ready: true },
	{ id: "player3", name: "Player 3", customization: {}, ready: false },
];

function Lobby() {
	const [lobbyId, setLobbyId] = useAtom(roomIdAtom);

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		const channel = window.channel;
		console.log(channel?.id, lobbyId);
	}, []);

	return (
		<main className="flex flex-col items-center w-screen">
			<div className="flex w-full max-w-5xl gap-4">
				<div className="w-8/12">
					<div className="grid grid-cols-4 gap-3 mb-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-md">
						{players.map((player, index) => (
							<div
								key={player.id}
								className={`bg-slate-200 bg-opacity-0 h-48 rounded-sm flex flex-col gap justify-between items-center ${
									index == 0
										? "border-stone-100 border-opacity-20 border-4 bg-opacity-0"
										: ""
								}`}
							>
								<div className="bg-[rgba(255,255,255,0.05)] m-2 [width:calc(100%-1rem)] h-full text-center rounded-sm">
									<div className="mt-3 mb-1">{player.name}</div>
									<div className="sprite [zoom:1.1] mx-auto"></div>
								</div>
								<div
									className={`bg-[rgba(255,255,255,0.05)] p-1 mb-2 [width:calc(100%-1rem)] text-center rounded-sm ${
										player.ready ? "bg-green-400 bg-opacity-70" : ""
									}`}
								>
									{player.ready ? "ready" : "not ready"}
								</div>
							</div>
						))}
						{new Array(8 - players.length).fill(0).map((_, index) => (
							<div
								key={players.length + index}
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
					<button className="w-full" onClick={() => 1}>
						Ready
					</button>
				</div>
			</div>
		</main>
	);
}

export default Lobby;
