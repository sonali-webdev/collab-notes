import { io } from "socket.io-client";

const socket = io("https://collab-notes-backend-efda.onrender.com", {
    withCredentials: true,
    autoConnect: false,
});

export default socket;