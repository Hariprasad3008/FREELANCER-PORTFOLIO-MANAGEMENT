import pool from "../config/db.js";

export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch conversations where user is a participant
    const query = `
      SELECT c.id, c.updated_at,
             (
               SELECT json_build_object(
                 'id', m.id,
                 'sender_id', m.sender_id,
                 'body', m.body,
                 'created_at', m.created_at
               )
               FROM messages m
               WHERE m.conversation_id = c.id
               ORDER BY m.created_at DESC
               LIMIT 1
             ) AS "lastMessage",
             (
               SELECT json_build_object(
                 'id', p.id,
                 'full_name', p.full_name,
                 'avatar_url', p.avatar_url,
                 'title', p.title,
                 'role', p.role
               )
               FROM conversation_participants cp2
               JOIN profiles p ON cp2.user_id = p.id
               WHERE cp2.conversation_id = c.id AND cp2.user_id != $1
               LIMIT 1
             ) AS "otherUser"
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrCreateConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "targetUserId is required.",
      });
    }

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself.",
      });
    }

    // Check if conversation already exists between both users
    const existing = await pool.query(
      `SELECT cp1.conversation_id
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
       WHERE cp1.user_id = $1 AND cp2.user_id = $2
       LIMIT 1;`,
      [userId, targetUserId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        conversationId: existing.rows[0].conversation_id,
      });
    }

    // Create new conversation
    const newConv = await pool.query(
      "INSERT INTO conversations DEFAULT VALUES RETURNING id;"
    );
    const conversationId = newConv.rows[0].id;

    // Add participants
    await pool.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3);`,
      [conversationId, userId, targetUserId]
    );

    res.status(201).json({
      success: true,
      conversationId,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Verify user is a participant
    const partCheck = await pool.query(
      `SELECT 1 FROM conversation_participants
       WHERE conversation_id = $1 AND user_id = $2;`,
      [conversationId, userId]
    );

    if (partCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation.",
      });
    }

    const result = await pool.query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.body, m.created_at,
              p.full_name AS sender_name, p.avatar_url AS sender_avatar
       FROM messages m
       JOIN profiles p ON m.sender_id = p.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC;`,
      [conversationId]
    );

    // Update read timestamp
    await pool.query(
      `UPDATE conversation_participants
       SET last_read_at = CURRENT_TIMESTAMP
       WHERE conversation_id = $1 AND user_id = $2;`,
      [conversationId, userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message body cannot be empty.",
      });
    }

    // Verify participant
    const partCheck = await pool.query(
      `SELECT 1 FROM conversation_participants
       WHERE conversation_id = $1 AND user_id = $2;`,
      [conversationId, senderId]
    );

    if (partCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation.",
      });
    }

    // Insert message
    const msgResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [conversationId, senderId, body.trim()]
    );

    // Update conversation timestamp
    await pool.query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;",
      [conversationId]
    );

    const message = msgResult.rows[0];
    message.sender_name = req.user.full_name;

    // Optional: emit socket message if global io is available
    if (req.app.get("io")) {
      req.app.get("io").to(`conv_${conversationId}`).emit("receive_message", message);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
}
