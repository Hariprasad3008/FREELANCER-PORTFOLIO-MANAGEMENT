import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_freelancer_marketplace_2026_secure';

// userId -> Set of socket IDs
const onlineUsers = new Map();

export const initChatSocket = (io) => {
  // 1. Handshake Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token missing.'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // { id, email, role, name }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const userName = socket.user.name || socket.user.full_name || 'User';
    console.log(`[Socket] User connected: ${userName} (${userId}) [Socket ID: ${socket.id}]`);

    // 2. Track Presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast current online user IDs
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // User joins their personal room for direct notifications
    socket.join(`user_${userId}`);

    // 3. Join Conversation Room
    socket.on('join_conversation', async ({ conversationId }) => {
      if (!conversationId) return;

      try {
        const check = await query(
          'SELECT conversation_id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
          [conversationId, userId]
        );

        if (check.rows.length > 0) {
          socket.join(`conv_${conversationId}`);
        }
      } catch (err) {
        console.error('[Socket] Error in join_conversation:', err.message);
      }
    });

    // 4. Leave Conversation Room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // 5. Send Message Flow
    socket.on('send_message', async ({ conversationId, body }, callback) => {
      if (!conversationId || !body || !body.trim()) {
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Message body and conversationId are required.' });
        }
        return;
      }

      try {
        // Verify participation
        const partCheck = await query(
          'SELECT user_id FROM conversation_participants WHERE conversation_id = $1',
          [conversationId]
        );

        const participantIds = partCheck.rows.map(r => r.user_id);
        if (!participantIds.includes(userId)) {
          if (typeof callback === 'function') {
            callback({ success: false, message: 'Unauthorized to post to this conversation.' });
          }
          return;
        }

        // Insert message
        const insertRes = await query(
          `INSERT INTO messages (conversation_id, sender_id, body) 
           VALUES ($1, $2, $3) 
           RETURNING id, conversation_id, sender_id, body, created_at`,
          [conversationId, userId, body.trim()]
        );

        const message = insertRes.rows[0];

        const fullMessage = {
          ...message,
          sender_name: userName,
          sender_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`,
          sender_role: socket.user.role?.toLowerCase()
        };

        // Update conversation last_message_at
        await query(
          'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
          [conversationId]
        );

        // Update sender's last_read_at
        await query(
          'UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2',
          [conversationId, userId]
        );

        // Broadcast to everyone in conversation room
        io.to(`conv_${conversationId}`).emit('receive_message', fullMessage);

        // Notify each participant for unread badge / list update
        participantIds.forEach(pId => {
          io.to(`user_${pId}`).emit('conversation_updated', {
            conversationId,
            lastMessage: fullMessage
          });
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: fullMessage });
        }
      } catch (err) {
        console.error('[Socket] Error sending message:', err.message);
        if (typeof callback === 'function') {
          callback({ success: false, message: 'Failed to send message.' });
        }
      }
    });

    // 6. Typing Indicators
    socket.on('typing', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conv_${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          userName
        });
      }
    });

    socket.on('stop_typing', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conv_${conversationId}`).emit('user_stop_typing', {
          conversationId,
          userId
        });
      }
    });

    // 7. Disconnect Handler
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userName} (${userId})`);
      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });
};
