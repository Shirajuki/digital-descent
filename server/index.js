import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";
import api from "./routes/api.js";
import BattleSystem from "./system/battleSystem.js";
import ExplorationSystem from "./system/explorationSystem.js";
import { DIALOGUES } from "./system/dialogues.js";

const rooms = {};

const app = express();
app.use(cors());
app.use("/api", api);

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});
io.on("connection", (channel) => {
	console.log(`${channel.id} connected`);
	io.emit(
		"lobby-listing",
		Object.keys(rooms)
			.map((roomId) => {
				return {
					id: roomId,
					name: rooms[roomId].name,
					joined: rooms[roomId].joined,
					status: rooms[roomId].status,
				};
			})
			.filter((room) => room.status === "lobby")
	);

	channel.on("disconnect", () => {
		console.log(`${channel.id} disconnected`);
		const roomId =
			Object.keys(rooms).filter((roomId) =>
				Object.keys(rooms[roomId].players).includes(channel.id)
			)[0] ??
			Object.keys(rooms).filter((roomId) =>
				rooms[roomId].joined.includes(channel.id)
			)[0];

		if (!roomId) return;
		// Remove player from room on disconnect
		if (rooms[roomId]) {
			delete rooms[roomId].players[channel.id];
			delete rooms[roomId].cursors[channel.id];
			rooms[roomId].joined = rooms[roomId].joined.filter(
				(id) => id === channel.id
			);
			// Emit disconnection to all clients
			io.to(roomId).emit("lobby-update", Object.values(rooms[roomId].players));
			io.to(roomId).emit("message-update", {
				sender: "[system]",
				message: "A player left the lobby.",
			});
			// Delete room if all players have left
			if (rooms[roomId]?.joined.length === 0) {
				delete rooms[roomId];
			}
		}
	});

	channel.on("message-send", (data) => {
		if (data?.message) {
			if (data?.private) {
				channel.emit("message-update", {
					sender: data?.sender ?? channel.id,
					message: data.message,
				});
			} else {
				io.to(channel.roomId).emit("message-update", {
					sender: data?.sender ?? channel.id,
					message: data.message,
				});
			}
		}
	});

	channel.on("dialogue", (data) => {
		const roomId = channel.roomId;
		if (!roomId || !data?.scenario) return;

		// Check if dialogue is done
		const count =
			rooms[roomId]?.dialogues?.filter((d) => d == data.scenario)?.length || 0;
		const players = Object.values(rooms[roomId].players).filter((p) => p.id);
		if (rooms[roomId] && count !== players.length) {
			if (data?.forceall) {
				io.to(roomId).emit("dialogue", {
					texts: DIALOGUES[data.scenario] ?? [],
					scenario: data.scenario,
				});
			} else {
				channel.emit("dialogue", {
					texts: DIALOGUES[data.scenario] ?? [],
					scenario: data.scenario,
				});
			}
		}
	});
	channel.on("dialogue-end", (data) => {
		const roomId = channel.roomId;
		if (!roomId || !data?.scenario) return;

		// Update dialogue ended
		rooms[roomId].dialogues.push(data.scenario);

		// Check if all players have ended the dialogue as well
		const count = rooms[roomId].dialogues.filter(
			(d) => d == data.scenario
		).length;
		const players = Object.values(rooms[roomId].players).filter((p) => p.id);
		console.log(count, players.length);
		if (count !== players.length) return;

		// Reset dialogue ended on all players
		// But skip over on some dialoges types
		if (
			![
				"GAME_INTRO",
				"CUSTOMER_INTRO",
				"ROLES",
				"DIGITALWORLD_INTRO",
				"TASKBOARD_INTRO",
				"PORTAL_INTRO",
				"SHOP_INTRO",
				"BEGIN_GAME",
				"BATTLE_INTRO",
				"EXPLORATION_INTRO",
			].includes(data.scenario)
		) {
			rooms[roomId].dialogues = rooms[roomId].dialogues.filter(
				(d) => d !== data.scenario
			);
		}

		// Sync dialogue end to all players
		io.to(channel.roomId).emit("dialogue-end", {
			scenario: data.scenario,
		});
	});
	channel.on("action", (data) => {
		const roomId = channel.roomId;
		if (!roomId || !data?.scenario) return;

		if (rooms[roomId]) {
			if (data?.forceall) {
				io.to(roomId).emit("action", {
					scenario: data.scenario,
				});
			} else {
				channel.emit("action", {
					scenario: data.scenario,
				});
			}
		}
	});
	channel.on("action-ready", (data) => {
		const roomId = channel.roomId;
		if (!roomId || !data?.scenario || !data?.ready) return;

		// Check if action is done
		const room = rooms[roomId];
		if (!rooms[roomId]) return;

		if (room.actions[data.scenario]) {
			room.actions[data.scenario][channel.id] = data.ready;
		} else {
			room.actions[data.scenario] = {};
			room.actions[data.scenario][channel.id] = data.ready;
		}

		const count = Object.values(room.actions[data.scenario]).filter(
			(d) => d
		).length;
		const players = Object.values(rooms[roomId].players).filter((p) => p.id);
		if (count !== players.length) return;

		if (rooms[roomId]) {
			// Reset action count
			room.actions[data.scenario] = {};

			// Emit action end to all clients
			io.to(roomId).emit("action", {
				scenario: data.scenario,
			});
		}
	});

	// Selects listeners
	// Specifically for portal selection as of now
	channel.on("selects-update", (data) => {
		const roomId = channel.roomId;
		if (!roomId) return;
		if (rooms[roomId]) {
			rooms[roomId].selects[channel.id] = data.select;
			io.to(roomId).emit("selects", {
				selects: rooms[roomId].selects,
				type: "selects-update",
			});
		}
	});
	channel.on("selects-reset", (data) => {
		const roomId = channel.roomId;
		if (!roomId) return;
		if (rooms[roomId]) {
			rooms[roomId].selects[channel.id] = null;
			io.to(roomId).emit("selects", {
				selects: rooms[roomId].selects,
				type: "selects-update",
			});
		}
	});

	channel.on("lobby-create", (data) => {
		const roomId = data.roomId;
		if (!roomId) return;
		if (!rooms[roomId]) {
			channel.join(roomId);
			channel.roomId = roomId;
			rooms[roomId] = {
				players: {},
				cursors: {},
				battle: {},
				exploration: {},
				name: data.name ?? "An open room",
				joined: [channel.id],
				status: "lobby",
				host: channel.id,
				dialogues: [],
				actions: {},
				selects: {},
			};
			rooms[roomId].players[channel.id] = {
				id: channel.id,
				name: "Player",
				customization: {},
				ready: false,
			};
			const players = Object.values(rooms[roomId]?.players)?.filter(
				(p) => p.id
			) || [""];
			io.to(roomId).emit("lobby-joined", { roomId, id: players.length - 1 });
			io.emit(
				"lobby-listing",
				Object.keys(rooms)
					.map((roomId) => {
						return {
							id: roomId,
							name: rooms[roomId].name,
							joined: rooms[roomId].joined,
							status: rooms[roomId].status,
						};
					})
					.filter((room) => room.status === "lobby")
			);
			console.log(`${channel.id} created room ${channel.roomId}`);
		}
	});
	channel.on("lobby-join", (data) => {
		console.log(data, rooms);
		const roomId = data.roomId;
		if (!roomId) return;

		// If room exists, join the room
		// TODO: set max number of players on room (4-6)?
		// TODO: eventually add password lock as well?
		if (rooms[roomId]) {
			channel.join(roomId);
			channel.roomId = roomId;
			rooms[roomId].players[channel.id] = {
				id: channel.id,
				name: "Player",
				customization: {},
				ready: false,
			};
			const players = Object.values(rooms[roomId]?.players)?.filter(
				(p) => p.id
			) || [""];
			rooms[roomId].joined.push(channel.id);
			io.to(roomId).emit("lobby-joined", { roomId, id: players.length - 1 });
			io.to(roomId).emit("message-update", {
				sender: "[system]",
				message: "A player joined the lobby.",
			});
		} else {
			// Else create a new room
			channel.join(roomId);
			channel.roomId = roomId;
			rooms[roomId] = {
				players: {},
				cursors: {},
				battle: {},
				exploration: {},
				name: "An open room",
				joined: [channel.id],
				status: "lobby",
				host: channel.id,
				dialogues: [],
				actions: {},
				selects: {},
			};
			rooms[roomId].players[channel.id] = {
				id: channel.id,
				name: "Player",
				customization: {},
				ready: false,
			};
			const players = Object.values(rooms[roomId]?.players)?.filter(
				(p) => p.id
			) || [""];
			io.to(roomId).emit("lobby-joined", { roomId, id: players.length - 1 });
		}
		io.emit(
			"lobby-listing",
			Object.keys(rooms)
				.map((roomId) => {
					return {
						id: roomId,
						name: rooms[roomId].name,
						joined: rooms[roomId].joined,
						status: rooms[roomId].status,
					};
				})
				.filter((room) => room.status === "lobby")
		);
		console.log(`${channel.id} joined room ${channel.roomId}`);
	});
	channel.on("lobby-update", (data) => {
		const roomId = channel.roomId;
		if (!roomId) return;
		if (rooms[roomId]) {
			if (data?.player) {
				rooms[roomId].players[channel.id] = data?.player;
			}
			io.to(roomId).emit("lobby-update", Object.values(rooms[roomId].players));
		}
	});
	channel.on("lobby-startgame", () => {
		const roomId = channel.roomId;
		if (!roomId) return;

		// Check if player is host
		if (rooms[roomId] && rooms[roomId].host === channel.id) {
			// If everyone in the lobby is ready, send start signal to all clients
			if (Object.values(rooms[roomId].players).every((p) => p.ready)) {
				rooms[roomId].lobbyPlayers = rooms[roomId].players;
				rooms[roomId].players = {};
				rooms[roomId].status = "game";
				io.to(roomId).emit("lobby-startgame", {});
			}
		}
	});

	channel.on("mouse-move", (data) => {
		const roomId = channel.roomId;
		if (!roomId) return;

		if (rooms[roomId] && channel.id !== "undefined") {
			rooms[roomId].cursors[channel.id] = {
				id: channel.id,
				x: data.x,
				y: data.y,
				scaling: data.scaling,
			};
			io.to(roomId).emit("mouse-move", {
				cursors: rooms[roomId].cursors,
				type: "mouse-move",
			});
		}
	});

	channel.on("game-update", (data) => {
		const roomId = channel.roomId;
		if (!roomId) return;

		if (rooms[roomId]) {
			rooms[roomId].players[channel.id] = data.player;
			io.to(roomId).emit("game-update", {
				players: rooms[roomId].players,
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
			io.to(channel.roomId).emit("exploration-initialize", {
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
			io.to(channel.roomId).emit("battle", {
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
			io.to(channel.roomId).emit("battle", {
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

			// Get attack information
			const attack = data.attack;
			let attackerEffects = attack.effects?.attacker ?? [];
			if (attackerEffects.length > 0) {
				const accuracy = attack.effects.attackerAccuracy;
				if (Math.random() * 100 > accuracy) {
					attackerEffects = [];
				}
			}
			let targetEffects = attack.effects?.target ?? [];
			if (targetEffects.length > 0) {
				const accuracy = attack.effects.targetAccuracy;
				if (Math.random() * 100 > accuracy) {
					targetEffects = [];
				}
			}

			let extraInfo = "";
			const damages = [];
			rooms[channel.roomId].battle.state = data.state;
			if (data.state.attacker?.effects?.some((e) => e.type === "lag")) {
				extraInfo = `${data.state.attacker.name} is lagging, turn skipped`;
			} else {
				// Apply effects to attacker
				attackerEffects.forEach((effect) => {
					const buff = effect.split("-");
					const players =
						buff[0] === "single"
							? Object.values(rooms[channel.roomId].players).filter(
									(p) => p.id === data.state.attacker.id
							  )
							: Object.values(rooms[channel.roomId].players).filter(
									(p) => p.id
							  );

					for (let i = 0; i < players.length; i++) {
						battle.applyEffects(players[i], buff[1]);
					}
				});

				// Apply effects to target
				targetEffects.forEach((effect) => {
					const buff = effect.split("-");
					const monsters =
						buff[0] === "single"
							? battle.monsters.filter((m) => m.id === data.state.target.id)
							: battle.monsters;

					for (let i = 0; i < monsters.length; i++) {
						battle.applyEffects(monsters[i], buff[1]);
					}
				});

				// Calculate player's damage on monsters
				for (const monster of battle.monsters) {
					let damage = { damage: 0, elementEffectiveness: 1 };
					if (
						attack.targets.type === "monster" &&
						monster.id === data.state.target.id &&
						monster.battleStats.HP > 0
					) {
						// Attack is targeted to one specific monsters
						damage = battle.calculateDamage(data.state.attacker, monster);
					} else if (
						attack.targets.type === "player" &&
						monster.battleStats.HP > 0
					) {
						// Attack is targeted to all monsters
						damage = battle.calculateDamage(data.state.attacker, monster);
					}
					damages.push(damage);

					monster.battleStats.HP -= damage.damage;
					if (monster.battleStats.HP <= 0) battle.queueRemove(monster);
				}
			}
			// Emit updated state to all clients and update the turn queue
			io.to(channel.roomId).emit("battle", {
				players: rooms[channel.roomId].players,
				battle: rooms[channel.roomId].battle,
				attack: {
					effects: {
						attacker: attackerEffects,
						attackerAccuracy: 100,
						target: targetEffects,
						targetAccuracy: 100,
					},
					damage: damages,
				},
				state: {
					...data.state,
					attacker: data.state.attacker.id,
					target: data.state.target.id,
				},
				extra: extraInfo,
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

			// Check if all monsters are dead
			if (battle.monsters.every((m) => m.battleStats.HP <= 0)) {
				const players = Object.values(rooms[channel.roomId].players).filter(
					(p) => p.id
				);
				const exp = battle.calculateExperience(battle.monsters);
				battle.state = {
					attacker: null,
					target: null,
					turn: "player",
					turnQueue: [],
				};
				battle.turns = 0;
				battle.turnQueue = [];
				battle.monsters = [];
				battle.players.forEach((p) => {
					p.battleStats = {
						HP: p.stats.HP,
						MP: p.stats.MP,
						AP: p.stats.AP,
					};
				});
				battle.initializeQueue();

				io.to(channel.roomId).emit("battle", {
					battle: rooms[channel.roomId].battle,
					players: players.map((p) => {
						p.stats.EXP += exp;
						const oldLevel = p.stats.LEVEL;
						battle.calculateLevelUp(p);
						return {
							id: p.id,
							stats: p.stats,
							exp: exp,
							levelUp: p.stats.LEVEL - oldLevel,
						};
					}),
					leveling: {
						ready: false,
						display: true,
					},
					type: "battle-end",
				});
				return;
			}
			// Check if all monsters are dead
			if (battle.players.every((p) => p.battleStats.HP <= 0)) {
				io.to(channel.roomId).emit("battle", {
					type: "battle-lose",
				});
				return;
			}

			if (battle.turnQueue[0].type === "monster") {
				// Calculate monsters's damage and emit updated state to all clients
				const monster = battle.turnQueue[0];
				// TODO: pick random player by weighting
				const player = players[0];

				let extraInfo = "";
				const damages = [];
				rooms[channel.roomId].battle.state = data.state;
				if (monster?.effects?.some((e) => e.type === "lag")) {
					extraInfo = `${monster.name} is lagging, turn skipped`;
				} else {
					for (let i = 0; i < players.length; i++) {
						let damage = { damage: 0, elementEffectiveness: 1 };
						if (players[i].battleStats.HP > 0 && player.id === players[i].id) {
							damage = battle.calculateDamage(monster, player);
						}
						damages.push(damage);
					}
				}

				io.to(channel.roomId).emit("battle", {
					players: rooms[channel.roomId].players,
					battle: rooms[channel.roomId].battle,
					attack: { effects: {}, damage: damages },
					state: {
						type: "single-attack",
						attacker: monster.id,
						target: player.id,
						running: true,
						text: "quick attack",
						finished: false,
						initialPosition: { x: 0, y: 0 },
					},
					extra: "",
					type: "battle-turn",
				});
				battle.updateTurn();
				battle.ready = 0;
			} else {
				io.to(channel.roomId).emit("battle", {
					type: "battle-pointer",
				});
				battle.ready = 0;
			}
		}
	});
	// Leveling listeners
	channel.on("leveling-ready", () => {
		if (rooms[channel.roomId]) {
			const battle = rooms[channel.roomId].battle;
			const players = Object.values(rooms[channel.roomId].players).filter(
				(p) => p.stats
			);
			// Check if all players are ready before continueing
			if (++battle.levelReady !== players.length) return;

			io.to(channel.roomId).emit("leveling", {
				type: "leveling-end",
			});
		}
	});
	channel.on("leveling-update", (data) => {
		if (rooms[channel.roomId] && data) {
			io.to(channel.roomId).emit("leveling", {
				type: "leveling-update",
				players: [data],
			});
		}
	});

	// Task listeners
	channel.on("task-initialize", (data) => {
		if (rooms[channel.roomId] && data.tasks) {
			io.to(channel.roomId).emit("task", {
				type: "task-initialize",
				tasks: data.tasks,
			});
		}
	});
	channel.on("task-update", (data) => {
		if (rooms[channel.roomId] && data) {
			io.to(channel.roomId).emit("task", {
				type: "task-update",
				openTasks: data.openTasks,
				currentTasks: data.currentTasks,
			});
		}
	});
});

server.listen(3000);
