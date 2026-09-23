import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import pool from "./config/db.js";
import { initSocketIO } from "./sockets/chatSocket.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.includes("localhost")) {
        return callback(null, true);
      }
      callback(null, true); // Permissive in dev, can restrict in strict prod
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
initSocketIO(io);

// Health Check Endpoints
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Freelancer Marketplace REST API & Socket.IO Server",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Freelancer Marketplace REST API is operational.",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time;");
    res.json({
      success: true,
      message: "PostgreSQL Database connected successfully.",
      db_time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "PostgreSQL Database connection failed.",
      error: error.message,
    });
  }
});

// API Routes Mount
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/messages", messageRoutes);

// Catch-all 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export { app, server, io };
