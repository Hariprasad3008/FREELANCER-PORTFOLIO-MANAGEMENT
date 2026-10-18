import http from 'http';
import { Server } from 'socket.io';
import app from './src/index.js';
import { initChatSocket } from './src/sockets/chatSocket.js';
import { testConnection } from './src/config/db.js';

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);

// Initialize Socket.IO with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup Real-time Chat Socket handlers
initChatSocket(io);

// Start Server & Test Database Connection
server.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚀 Freelancer Backend running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server initialized`);
  console.log(`📡 CORS configured for origin: ${CLIENT_URL}`);
  console.log(`=========================================`);
  
  await testConnection();
});
