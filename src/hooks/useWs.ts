import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { path: "/ws/" });

socket.on("connect", () => {
	console.log("client connected");
});
const messageCallbacks: Set<(data: string) => void> = new Set();

const registerOnMessage = (cb: (data: string) => void) => {
	messageCallbacks.forEach((existingCb) => {
		socket.off("message", existingCb);
	});

	// Clear the set and add the new callback
	messageCallbacks.clear();
	messageCallbacks.add(cb);

	socket.on("message", cb);
};

socket.on("connect_error", (error) => {
	console.error("Socket connection error:", error);
});

export { registerOnMessage };
