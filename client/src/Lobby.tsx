import { useAtom } from "jotai";
import { lobbyIdAtom } from "./lib/atoms";
import { useEffect, useRef } from "react";

import geckos from "@geckos.io/client";

function Lobby() {
	const [lobbyId, setLobbyId] = useAtom(lobbyIdAtom);

	// Load geckos channel and initialize listeners for geckos
	useEffect(() => {
		const channel = geckos({ port: 3000 });
		window.channel = channel;

		channel.onConnect((error: any) => {
			if (error) return console.error(error.message);

			channel.on("joined", (data: any) => {
				setLobbyId(data);
				console.log(`You joined the room ${data}`);
			});

			channel.emit("join", { roomId: "test-room" });
		});
	}, []);

	return (
		<div className="App">
			<div>Lobby</div>
		</div>
	);
}

export default Lobby;
