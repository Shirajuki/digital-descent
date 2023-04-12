import geckos from "@geckos.io/server";
import http from "http";
import express from "express";
import api from "./routes/api.js";
import BattleSystem from "./system/battleSystem.js";
import ExplorationSystem from "./system/explorationSystem.js";

const rooms = {};

const app = express();
app.use("/api", api);

const server = http.createServer(app);
const io = geckos();
io.addServer(server);
io.onConnection((channel) => {
	console.log(`${channel.id} connected`);
	io.emit(
		"lobby-listing",
		Object.keys(rooms).map((roomId) => {
			return {
				id: roomId,
				name: rooms[roomId].name,
				joined: rooms[roomId].joined,
			};
		})
	);

	channel.onDisconnect(() => {
		console.log(`${channel.id} disconnected`);
		const roomId = Object.keys(rooms).filter((roomId) =>
			rooms[roomId].joined.includes(channel.id)
		)[0];
		console.log(rooms, roomId, channel.id);
		// Remove player from room on disconnect
		if (rooms[roomId]) {
			delete rooms[roomId].players[channel.id];
			rooms[roomId].joined = rooms[roomId].joined.filter(
				(id) => id === channel.id
			);
			// Delete room if all players have left
			if (rooms[roomId]?.joined.length === 0) {
				delete rooms[roomId];
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

	channel.on("lobby-create", (data) => {
		const roomId = data.roomId;
		if (!roomId) return;
		if (!rooms[roomId]) {
			channel.join(roomId);
			rooms[roomId] = {
				players: {},
				battle: {},
				exploration: {},
				name: data.name ?? "An open room",
				joined: [channel.id],
				status: "started",
			};
			io.room(roomId).emit("lobby-joined", roomId);
			io.emit(
				"lobby-listing",
				Object.keys(rooms).map((roomId) => {
					return {
						id: roomId,
						name: rooms[roomId].name,
						joined: rooms[roomId].joined,
					};
				})
			);
		}
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
			rooms[roomId].joined.push(channel.id);
			io.room(roomId).emit("lobby-joined", roomId);
		} else {
			// Else create a new room
			channel.join(roomId);
			rooms[roomId] = {
				players: {},
				battle: {},
				exploration: {},
				name: "An open room",
				joined: [channel.id],
				status: "started",
			};
			io.room(roomId).emit("lobby-joined", roomId);
		}
		io.emit(
			"lobby-listing",
			Object.keys(rooms).map((roomId) => {
				return {
					id: roomId,
					name: rooms[roomId].name,
					joined: rooms[roomId].joined,
				};
			})
		);
		console.log(`${channel.id} joined room ${channel.roomId}`);
	});
	channel.on("lobby-update", (data) => {
		if (rooms[channel.roomId]) {
			if (data?.player) {
				console.log(data?.player);
			}
			io.room(roomId).emit("lobby-update", []);
		}
	});

	channel.on("game-update", (data) => {
		if (rooms[channel.roomId]) {
			rooms[channel.roomId].players[channel.id] = data.player;
			io.room(channel.roomId).emit("game-update", {
				players: rooms[channel.roomId].players,
				type: "game-update",
			});
		}
	});

	// Exploration listeners
	channel.on("exploration-initialize", (data) => {
		if (rooms[channel.roomId] && data) {
			// Initialize new exploration area if not found
			const players = Object.values(rooms[channel.roomId].players).filter(
				(p) => p.stats
			);
			if (rooms[channel.roomId].status !== "exploring") {
				const areas = data.exploration.areas;
				rooms[channel.roomId].status = "exploring";
				rooms[channel.roomId].exploration = new ExplorationSystem(
					players,
					areas
				);
			} else {
				rooms[channel.roomId].exploration.players = players;
				rooms[channel.roomId].exploration.initializeDifficulty();
			}
			io.room(channel.roomId).emit("exploration-initialize", {
				exploration: rooms[channel.roomId].exploration,
				type: "exploration-initialize",
			});
		}
	});

	// Battle listeners
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
			console.log(rooms[channel.roomId].players);
			io.room(channel.roomId).emit("battle", {
				battle: rooms[channel.roomId].battle,
				type: "battle-initialize",
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
			io.room(channel.roomId).emit("battle", {
				players: rooms[channel.roomId].players,
				battle: rooms[channel.roomId].battle,
				type: "battle-update",
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
			// Check and set monster dead status if hp == 0
			const monster = battle.monsters.find(
				(m) => m.id === data.state.target.id
			);
			monster.battleStats.HP -= damage.damage;
			if (monster.battleStats.HP <= 0) battle.queueRemove(monster);

			// Update the turn queue
			io.room(channel.roomId).emit("battle", {
				players: rooms[channel.roomId].players,
				battle: rooms[channel.roomId].battle,
				damage: damage,
				state: {
					...data.state,
					attacker: data.state.attacker.id,
					target: data.state.target.id,
				},
				type: "battle-turn",
			});
			battle.updateTurn();
		}
	});
	channel.on("battle-turn-finished", (data) => {
		if (rooms[channel.roomId] && data) {
			const battle = rooms[channel.roomId].battle;
			// Skip handling monster calculation if it's a player's turn
			if (battle.turns !== data.turns) return;
			// Check if all players are ready before continueing
			const players = Object.values(rooms[channel.roomId].players).filter(
				(p) => p.id
			);
			if (++battle.ready !== players.length) return;
			if (battle.turnQueue[0].type === "monster") {
				// Calculate monsters's damage and emit updated state to all clients
				const monster = battle.turnQueue[0];
				// TODO: pick random player by weighting
				const player = players[0];
				const damage = battle.calculateDamage(monster, player);
				io.room(channel.roomId).emit("battle", {
					players: rooms[channel.roomId].players,
					battle: rooms[channel.roomId].battle,
					damage: damage,
					state: {
						attacker: monster.id,
						target: player.id,
						attacking: true,
						attacked: false,
						initialPosition: { x: 0, y: 0 },
					},
					type: "battle-turn",
				});
				battle.updateTurn();
				battle.ready = 0;
			} else {
				io.room(channel.roomId).emit("battle", {
					type: "battle-pointer",
				});
				battle.ready = 0;
			}
		}
	});
});

server.listen(3000);
