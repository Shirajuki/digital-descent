import geckos from "@geckos.io/server";
import http from "http";
import express from "express";
import api from "./routes/api.js";
import BattleSystem from "./system/battleSystem.js";

const rooms = {};

const app = express();
app.use("/api", api);

const server = http.createServer(app);
const io = geckos();
io.addServer(server);
io.onConnection((channel) => {
	console.log(`${channel.id} connected`);

	channel.onDisconnect(() => {
		console.log(`${channel.id} disconnected`);

		// Remove player from room on disconnect
		if (rooms[channel.roomId]) {
			delete rooms[channel.roomId].players[channel.id];
			// Delete room if all players have left
			if (rooms[channel.roomId]?.players?.length === 0) {
				delete rooms[channel.roomId];
			}
		}
	});

	channel.on("message-send", (data) => {
		if (data?.message)
			io.room(channel.roomId).emit("message-update", {
				sender: channel.id,
				message: data.message,
			});
	});

	channel.on("lobby-join", (data) => {
		const roomId = data.roomId;
		if (!roomId) return;

		// If room exists, join the room
		// TODO: set max number of players on room (4-6)?
		// TODO: eventually add password lock as well?
		if (rooms[roomId]) {
			channel.join(roomId);
			rooms[roomId].players[data.id] = data;
			io.room(roomId).emit("lobby-joined", roomId);
		} else {
			// Else create a new room
			channel.join(roomId);
			rooms[roomId] = { players: {}, battle: {}, status: "started" };
			io.room(roomId).emit("lobby-joined", roomId);
		}
		console.log(`${channel.id} joined room ${channel.roomId}`);
	});

	channel.on("game-update", (data) => {
		if (rooms[channel.roomId]) {
			rooms[channel.roomId].players[data.id] = data;
			io.room(channel.roomId).emit(
				"game-update",
				rooms[channel.roomId].players
			);
		}
	});

	channel.on("battle-initialize", (data) => {
		if (rooms[channel.roomId] && data) {
			// Initialize new battle if not found
			const players = Object.values(rooms[channel.roomId].players).filter(
				(p) => p.stats
			);
			if (rooms[channel.roomId].status !== "battling") {
				const monsters = data.monsters;
				rooms[channel.roomId].status = "battling";
				rooms[channel.roomId].battle = new BattleSystem(players, monsters);
			} else {
				// Update players list
				rooms[channel.roomId].battle.players = players;
				rooms[channel.roomId].battle.initializeQueue();
			}
			io.room(channel.roomId).emit("battle-initialize", {
				battle: rooms[channel.roomId].battle,
			});
		}
	});
	channel.on("battle-update", (data) => {
		if (
			rooms[channel.roomId] &&
			data?.player &&
			data?.player?.id !== "undefined"
		) {
			rooms[channel.roomId].players[data.player.id] = data.player;
			// rooms[channel.roomId].battle = data;
			io.room(channel.roomId).emit("battle-update", {
				players: rooms[channel.roomId].players,
				battle: rooms[channel.roomId].battle,
			});
		}
	});
	channel.on("battle-turn", (data) => {
		if (rooms[channel.roomId] && data) {
			const battle = rooms[channel.roomId].battle;
			// If not player's turn, then skip
			if (battle.turnQueue[0].id !== channel.id) return;

			// Calculate player's damage and emit updated state to all clients
			rooms[channel.roomId].battle.state = data.state;
			const damage = battle.calculateDamage(
				data.state.attacker,
				data.state.target
			);
			// Update the turn queue
			battle.updateTurn();
			io.room(channel.roomId).emit("battle-turn", {
				players: rooms[channel.roomId].players,
				battle: rooms[channel.roomId].battle,
				damage: damage,
				state: {
					...data.state,
					attacker: data.state.attacker.id,
					target: data.state.target.id,
				},
			});
		}
	});
	channel.on("battle-turn-finished", () => {
		if (rooms[channel.roomId]) {
			const battle = rooms[channel.roomId].battle;
			if (battle.turnQueue[0].type !== "monster") return;
			// Skip through monsters turn for now
			while (battle.updateTurn()) {
				continue;
			}
		}
	});
});

server.listen(3000);
