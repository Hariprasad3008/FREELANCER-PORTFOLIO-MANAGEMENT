import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "freelancer_jwt_secret_key_default_2026";
const onlineUsers = new Map(); // userId -> Set of socketIds

export function initSocketIO(io) {
  // Authentication handshake middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication token required for WebSocket connection"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Invalid WebSocket authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const userName = socket.user.full_name;

    console.log(`🔌 Socket connected: ${userName} (${userId}) - Socket ID: ${socket.id}`);

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.join(room);
      console.log(` User ${userName} joined room: ${room}`);
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.leave(room);
      console.log(` User ${userName} left room: ${room}`);
    });

    // Send real-time message
    socket.on("send_message", async ({ conversationId, body }, callback) => {
      try {
        if (!body || !body.trim() || !conversationId) return;

        // Persist message in PostgreSQL database
        const msgResult = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, body)
           VALUES ($1, $2, $3)
           RETURNING *;`,
          [conversationId, userId, body.trim()]
        );

        // Update conversation timestamp
        await pool.query(
          "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;",
          [conversationId]
        );

        const newMsg = {
          ...msgResult.rows[0],
          sender_name: userName,
        };

        const room = `conv_${conversationId}`;
        // Broadcast to all participants in this conversation room
        io.to(room).emit("receive_message", newMsg);

        if (typeof callback === "function") {
          callback({ success: true, data: newMsg });
        }
      } catch (error) {
        console.error("❌ Socket send_message error:", error);
        if (typeof callback === "function") {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Typing indicators
    socket.on("typing", ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit("user_typing", {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit("user_stop_typing", {
        conversationId,
        userId,
      });
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${userName} (${socket.id})`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
}
