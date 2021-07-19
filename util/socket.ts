import { io } from "socket.io-client";

const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
const socket = io(`${server_url}`, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

socket.onAny((event, ...args) => {
  console.log(event, args, "onAny");
});

export default socket;
