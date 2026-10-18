import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token) => {
  const currentToken = token || localStorage.getItem('freelancer_token');

  if (!currentToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  // Initialize Socket.IO connection
  socket = io(window.location.origin, {
    auth: {
      token: currentToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[SocketClient] Connected with ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[SocketClient] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
