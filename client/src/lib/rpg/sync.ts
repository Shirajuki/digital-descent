import { initializePlayer } from "./player";

export const removeDuplicatePlayers = (scene: any, serverPlayers: any[]) => {
	// Remove duplicate players and also remove disconnected
	for (let i = 0; i < scene.players.length; i++) {
		const player = scene.players[i];
		if (
			(!serverPlayers.includes(player.id) && scene.player?.id !== player.id) ||
			(scene.player?.id == player.id && scene.player != player)
		) {
			const p = scene.players.splice(i, 1)[0];
			p.destroy();
		}
	}
};

export const addPlayers = (
	scene: any,
	serverPlayers: any[],
	serverPlayersData: any[]
) => {
	// Add new players if found
	const clientPlayers = scene.players.map((player: any) => player.id);
	// console.log(clientPlayers, serverPlayers);
	for (let i = 0; i < serverPlayers.length; i++) {
		if (!clientPlayers.includes(serverPlayers[i])) {
			const player: any = initializePlayer(scene, serverPlayersData[i].id);
			player.id = serverPlayersData[i].id;
			player.name = serverPlayersData[i].id;
			scene.players.push(player);
		}
	}
};

export const updatePlayers = (scene: any, playerData: any) => {
	// Update player position
	for (let i = 0; i < scene.players.length; i++) {
		const player = scene.players[i];
		if (player.id === scene.player?.id) continue;
		player.x = playerData[player.id].x;
		player.y = playerData[player.id].y;
		player.movement = playerData[player.id].movement;
		player.onTeleportingPad = playerData[player.id].onTeleportingPad;
		player.updatePlayerAnimation();
		player.setDepth(player.y);
	}
};
