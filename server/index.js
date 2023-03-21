import geckos from "@geckos.io/server";
import http from "http";
import express from "express";
import { connect } from "http2";

const app = express();
const server = http.createServer(app);
const io = geckos();

const players = {
	test: {},
};

const lobbyId = "test";

io.addServer(server);
io.onConnection((channel) => {
	console.log(`${channel.id} connected to ${channel.roomId}`);
	channel.join("test");

	channel.onDisconnect(() => {
		console.log(`${channel.id} got disconnected`);
		if (players[lobbyId][channel.id]) {
			delete players[lobbyId][channel.id];
		}
	});

	channel.on("chat message", (data) => {
		console.log(`got ${data} from "chat message"`);
		// emit the "chat message" data to all channels in the same room
		io.room(channel.roomId).emit("chat message", data);
	});

	channel.on("update", (data) => {
		players[lobbyId][data.id] = data;
		console.log(players[lobbyId]);
		io.room(lobbyId).emit("update", players[lobbyId]);
	});
});

server.listen(3000);
