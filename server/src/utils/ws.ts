// ws.ts
import { Server, Socket } from "socket.io";

import { httpServer, corsOptions } from "../server";

const messageQueue: string[] = [];

const io = new Server(httpServer, {
	path: "/ws/",
	cors: corsOptions,
});

io.on("connection", (socket: Socket) => {
	console.log("Client connected", socket.id);

	// Send queued messages to the newly connected client
	// messageQueue.forEach((msg: string) => {
	// 	socket.emit("message", msg);
	// });

	socket.on("disconnect", () => {
		console.log("Client disconnected", socket.id);
	});
});

const broadcast = (data: string) => {
	// if (io.engine.clientsCount === 0) {
	// messageQueue.push(data);
	// } else {
	io.emit("message", data);
	// }
};

export { broadcast };
