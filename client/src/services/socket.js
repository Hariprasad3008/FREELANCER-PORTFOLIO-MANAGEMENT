import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export function getSocket() {
  const token = localStorage.getItem("freelancer_token");

  if (!socket && token) {
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log(" Connected to Socket.IO Server!");
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from Socket.IO:", reason);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}
