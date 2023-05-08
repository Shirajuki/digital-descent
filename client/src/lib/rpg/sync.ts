import { NAMES, PLAYER_COLORS } from "../constants";
import { initializePlayer } from "./player";

export const removeDuplicatePlayers = (scene: any, serverPlayers: any[]) => {
	// Remove duplicate players and also remove disconnected
	for (let i = 0; i < scene.players.length; i++) {
		const player = scene.players[i];
		if (!scene.player?.id || !player?.id) continue;
		if (
			(!serverPlayers.includes(player.id) && scene.player?.id !== player.id) ||
			(scene.player?.id == player.id && scene.player != player) ||
			!player.displayList
		) {
			player.setAlpha(0);
			player.nameEntity.setAlpha(0);
			player.nameEntity.destroy();
			player.destroy();
			scene.players.splice(i, 1);
		}
	}
};

export const addPlayers = (
	scene: any,
	serverPlayers: any[],
	serverPlayersData: any[]
) => {
	// Add new players if found
	const clientPlayers = scene.players
		.map((player: any) => player?.id)
		.filter((p: any) => p);
	if (!scene.player?.id) return;
	for (let i = 0; i < serverPlayers.length; i++) {
		if (serverPlayers[i] === scene.player?.id) {
			if (scene.player.name.startsWith("Player")) {
				window.playerName = NAMES[window.playerIndex ?? i];
				scene.player.name = window.playerName;
				scene.player.nameEntity.setText(window.playerName);
			}
			continue;
		}
		if (!clientPlayers.includes(serverPlayers[i])) {
			const data = serverPlayersData[i];
			const name = data.name ?? NAMES[i];
			const player: any = initializePlayer(scene, name);
			player.id = data.id;
			player.name = name;
			player.nameEntity.setText(name);
			if (data.stats) player.stats = data.stats;
			if (data.battleStats) player.battleStats = data.battleStats;
			if (data.inventory) player.inventory = data.inventory;
			if (data.equipment) player.equipment = data.equipment;
			if (data.battleClass) player.battleClass = data.battleClass;
			scene.players.push(player);
			scene.observable.notify();
		}
	}
	// console.log(clientPlayers, serverPlayers);
};

export const reorderPlayers = (scene: any, serverPlayers: any[]) => {
	const clientPlayers = scene.players.map((player: any) => player?.id);
	if (!scene.player?.id) return;
	// If clientPlayers and serverPlayers mismatch
	if (clientPlayers.join() !== serverPlayers.join()) {
		// Reorder clientPlayers to be like serverPlayers
		const orderedPlayers = serverPlayers.map((pid: string) =>
			scene.players.find((p: any) => p?.id === pid)
		);
		scene.players = orderedPlayers;

		// Fix current player
		if (!scene.players.find((p: any) => p === scene.player)) {
			scene.players.find((p: any) => p?.id === scene.player?.id)?.destroy();
			scene.players = scene.players.map((p: any) =>
				p?.id === scene.player?.id ? scene.player : p
			);
		}

		// Update name on player
		// for (let i = 0; i < scene.players.length; i++) {
		// 	const player = scene.players[i];
		// 	if (player) {
		// 		player.name = NAMES[player?.index || i];
		// 	}
		// }
	}
};

export const updatePlayers = (scene: any, playerData: any) => {
	// Update player position
	for (let i = 0; i < scene.players.length; i++) {
		const player = scene.players[i];
		if (!scene.player?.id || !player?.id) continue;
		if (!player) {
			scene.players[i] = scene.player;
			continue;
		}
		if (!player?.name || !playerData[player.id]?.name) continue;
		if (
			playerData[player.id]?.name &&
			player?.name !== playerData[player.id]?.name
		) {
			const name = playerData[player.id].name.startsWith("Player")
				? NAMES[i]
				: playerData[player.id].name;
			player.name = name;
			player.nameEntity.setText(name);
		}
		if (player.id === scene.player?.id) continue;
		player.x = playerData[player.id].x;
		player.y = playerData[player.id].y;
		player.movement = playerData[player.id].movement;
		player.onTeleportingPad = playerData[player.id].onTeleportingPad;
		player.eventCollision = playerData[player.id].eventCollision;
		player.battleClass = playerData[player.id].battleClass;
		if (player.movement) player.updatePlayerAnimation();
		player.setDepth(player.y);
		player.nameEntity.x = player.x;
		player.nameEntity.y = player.y - 40;
		player.nameEntity.setDepth(player.y + 1);
		player.index = i;
	}
};
