import { NAMES } from "../constants";
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
	for (let i = 0; i < serverPlayers.length; i++) {
		if (!clientPlayers.includes(serverPlayers[i])) {
			const player: any = initializePlayer(scene, serverPlayersData[i].id);
			player.id = serverPlayersData[i].id;
			player.name = NAMES[i] ?? serverPlayersData[i].id;
			scene.players.push(player);
		}
		if (serverPlayers[i] === scene.player?.id) {
			scene.player.name = NAMES[i];
			window.playerName = NAMES[i] ?? "Player";
		}
	}
	// console.log(clientPlayers, serverPlayers);
};

export const reorderPlayers = (scene: any, serverPlayers: any[]) => {
	const clientPlayers = scene.players.map((player: any) => player.id);
	// If clientPlayers and serverPlayers mismatch
	if (clientPlayers.join() !== serverPlayers.join()) {
		// Reorder clientPlayers to be like serverPlayers
		const orderedPlayers = serverPlayers.map((pid: string) =>
			scene.players.find((p: any) => p.id === pid)
		);
		scene.players = orderedPlayers;

		// Fix current player
		if (!scene.players.find((p: any) => p === scene.player)) {
			scene.players.find((p: any) => p.id === scene.player?.id)?.destroy();
			scene.players = scene.players.map((p: any) =>
				p.id === scene.player?.id ? scene.player : p
			);
		}

		// Update name on player
		for (let i = 0; i < scene.players.length; i++) {
			const player = scene.players[i];
			player.name = NAMES[i];
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
		player.eventCollision = playerData[player.id].eventCollision;
		if (player.movement) player.updatePlayerAnimation();
		player.setDepth(player.y);
	}
};
