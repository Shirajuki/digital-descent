import geckos from "@geckos.io/server";
import http from "http";
import express from "express";
import api from "./routes/api.js";

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

	channel.on("join", (data) => {
		const roomId = data.roomId;
		if (!roomId) return;

		// If room exists, join room
		// TODO: set max number of players on room (4-6)?
		// TODO: eventually add password lock as well?
		if (rooms[roomId]) {
			channel.join(roomId);
			rooms[roomId].players[data.id] = data;
			io.room(roomId).emit("joined", roomId);
		} else {
			// Else create new room
			channel.join(roomId);
			rooms[roomId] = { players: {}, status: "started" };
			io.room(roomId).emit("joined", roomId);
		}
		console.log(`${channel.id} joined room ${channel.roomId}`);
	});

	channel.on("update", (data) => {
		if (rooms[channel.roomId]) {
			rooms[channel.roomId].players[data.id] = data;
			io.room(channel.roomId).emit("update", rooms[channel.roomId].players);
		}
	});
});

server.listen(3000);
