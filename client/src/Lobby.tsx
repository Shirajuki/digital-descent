import { useAtom } from "jotai";
import { roomIdAtom } from "./lib/atoms";
import { useEffect, useRef } from "react";

import geckos from "@geckos.io/client";
import Chat from "./lib/components/chat/Chat";

function Lobby() {
	const [lobbyId, setLobbyId] = useAtom(roomIdAtom);

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

	return (
		<div className="App">
			<div>Lobby</div>
			<Chat channel={window.channel} />
		</div>
	);
}

export default Lobby;
