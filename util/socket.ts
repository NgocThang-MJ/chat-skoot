import { io } from "socket.io-client";

const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
const socket = io(`${server_url}`, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
