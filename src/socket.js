import io from "socket.io-client";

// const SOCKET_URL = `http://localhost:5000`;
const SOCKET_URL = `https://mebelx.abdujabborov.uz/`;
const socket = io(SOCKET_URL, { transports: ["websocket"] });

export default socket;
