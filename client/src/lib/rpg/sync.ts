import { NAMES, PLAYER_COLORS } from "../constants";
import { initializePlayer } from "./player";

export const removeDuplicatePlayers = (scene: any, serverPlayers: any[]) => {
	if (!scene.players) return;
	// Remove duplicate players and also remove disconnected
	for (let i = 0; i < scene.players.length; i++) {
		const player = scene.players[i];
		if (!scene.player?.id || !player?.id) continue;
		if (
			(!serverPlayers.includes(player.id) && scene.player?.id !== player.id) ||
			(scene.player?.id == player.id && scene.player != player) ||
			!player.displayList
		) {
			console.log("REMOVING PLAYER", player);
			player.setAlpha(0);
			player.nameEntity.destroy();
			player.shadow.destroy();
			player.destroy();
			scene.players.splice(i, 1);
		}
	}
	scene.players = scene.players.filter((p: any) => p?.id);
};

export const addPlayers = (
	scene: any,
	serverPlayers: any[],
	serverPlayersData: any[]
) => {
	if (!scene.players) return;
	// Add new players if found
	const clientPlayers = scene.players
		.map((player: any) => player?.id)
		.filter((p: any) => p);
	if (!scene.player?.id) return;
	for (let i = 0; i < serverPlayers.length; i++) {
		// If player is current player
		if (serverPlayers[i] === scene.player?.id) {
			const name = NAMES[window.playerIndex ?? i];
			if (window.playerName !== name) {
				window.playerName = name;
				scene.player.name = window.playerName;
				scene.player.nameEntity.setText(window.playerName);
			}
			continue;
		}
		// If player is not current player
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
			console.log(window.channel.id, data.id, data.name, scene.players);
			scene.observable.notify();

			// Make player clickable if current scene is nattle
			if (scene.game.currentScene == "battle") {
				// Set players to be clickable
				player.setInteractive();
				player.on("pointerup", () => {
					if (!scene.battle.state.running && !player.battleStats.dead) {
						scene.battle.state.target = scene.battle.players[i];
						scene.observable.notify();
					}
				});
				setTimeout(() => {
					scene.observable.notify();
				}, 1000);
			}
		}
	}
	// console.log(clientPlayers, serverPlayers);
};

export const reorderPlayers = (scene: any, serverPlayers: any[]) => {
	if (!scene.players) return;
	if (!scene.player?.id) return;

	// Reorder clientplayers to follow the ordering of NAMES
	const orderedClientPlayers = NAMES.map((name: string) =>
		scene.players.find((p: any) => p?.name === name)
	);
	orderedClientPlayers.length = scene.players.length;

	const orderedPlayers = orderedClientPlayers.map((player: any) => player?.id);
	const clientPlayers = scene.players.map((player: any) => player?.id);

	// If not same order, reorder
	if (clientPlayers.join() !== orderedPlayers.join()) {
		console.log(clientPlayers, orderedPlayers, scene.players);
		// sort scene.players by alphabetical order on name
		scene.players.sort((a: any, b: any) => {
			if (a?.name < b?.name) return -1;
			if (a?.name > b?.name) return 1;
			return 0;
		});

		// Fix current player if not in the right position of the array
		const currentPlayer = scene.players.find((p: any) => p === scene.player);
		if (!currentPlayer) {
			// Remove current player if not in the right position of the array and replace with new player
			scene.players = scene.players.forEach((p: any, i: number) => {
				if (p?.id === scene.player?.id || p === undefined) {
					p?.destroy();
					p?.nameEntity?.destroy();
					p?.shadow?.destroy();
					scene.players[i] = scene.player;
					scene.player = window.playerName || NAMES[window.playerIndex || 0];
				}
			});
		}
		return false;
	}
	return true;
};

export const updatePlayers = (scene: any, playerData: any) => {
	if (!scene.players) return;
	// Update player position
	for (let i = 0; i < scene.players.length; i++) {
		const player = scene.players[i];
		if (!scene.player?.id || !player?.id) continue;
		if (!player) {
			scene.players[i] = scene.player;
			scene.player.name = window.playerName || NAMES[window.playerIndex || 0];
			continue;
		}

		// Skip if player is current player
		if (player.id === scene.player?.id) continue;
		// Skip if player name is not set
		if (!player?.name || !playerData[player.id]?.name) continue;

		// Update player position and attributes
		player.x = playerData[player.id].x;
		player.y = playerData[player.id].y;
		player.movement = playerData[player.id].movement;
		player.onTeleportingPad = playerData[player.id].onTeleportingPad;
		player.eventCollision = playerData[player.id].eventCollision;
		player.battleClass = playerData[player.id].battleClass;

		// Sync player battle info
		player.stats = playerData[player.id].stats;
		player.battleStats = playerData[player.id].battleStats;
		player.effects = playerData[player.id].effects;

		if (player.movement) player.updatePlayerAnimation();
		player.setDepth(player.y);

		// Update player name
		if (player.nameEntity.name != playerData[player.id].name) {
			player.name = playerData[player.id].name;
			player.nameEntity.setText(player.name);
		}
		player.nameEntity.x = player.x;
		player.nameEntity.y = player.y - 40;
		player.nameEntity.setDepth(player.y + 20000);

		// Update player shadow
		player.shadow.x = player.x;
		player.shadow.y = player.y + 35;
		player.shadow.setDepth(player.y - 1);
		if (playerData[player.id].shadowAlpha !== undefined) {
			player.shadow.setAlpha(playerData[player.id].shadowAlpha);
		}
		player.index = i;
	}
};
