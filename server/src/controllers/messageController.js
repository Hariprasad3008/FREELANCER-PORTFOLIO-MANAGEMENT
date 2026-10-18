import { query } from '../config/db.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        c.id,
        c.project_id,
        c.last_message_at AS updated_at,
        p_other.id AS other_user_id,
        p_other.name AS other_user_name,
        p_other.avatar_url AS other_user_avatar,
        p_other.role AS other_user_role,
        COALESCE(fp.title, cp.company_name, p_other.role) AS other_user_title,
        last_msg.body AS last_message_body,
        last_msg.sender_id AS last_message_sender_id,
        last_msg.created_at AS last_message_time,
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND (cp_me.last_read_at IS NULL OR m.created_at > cp_me.last_read_at)
        ) AS unread_count
      FROM conversations c
      JOIN conversation_participants cp_me 
        ON c.id = cp_me.conversation_id AND cp_me.user_id = $1
      JOIN conversation_participants cp_other 
        ON c.id = cp_other.conversation_id AND cp_other.user_id != $1
      JOIN users p_other 
        ON cp_other.user_id = p_other.id
      LEFT JOIN freelancer_profiles fp ON p_other.id = fp.user_id
      LEFT JOIN client_profiles cp ON p_other.id = cp.user_id
      LEFT JOIN LATERAL (
        SELECT body, sender_id, created_at 
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) last_msg ON true
      ORDER BY c.last_message_at DESC;
    `;

    const result = await query(sql, [userId]);
    res.json({
      success: true,
      conversations: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createOrGetConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rawTarget =
      req.body.recipientId ||
      req.body.recipient_id ||
      req.body.userId ||
      req.body.freelancerId ||
      req.body.clientId ||
      req.params.recipientId ||
      req.params.id ||
      req.query.recipientId ||
      req.query.userId;
    const projectId = req.body.projectId || req.body.project_id || req.query.projectId;

    if (!rawTarget) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required.'
      });
    }

    // Resolve recipient user ID if a profile ID or user ID was passed
    let resolvedRecipientId = rawTarget;
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [rawTarget]);
    if (userCheck.rows.length === 0) {
      const fpCheck = await query('SELECT user_id FROM freelancer_profiles WHERE id = $1', [rawTarget]);
      if (fpCheck.rows.length > 0) {
        resolvedRecipientId = fpCheck.rows[0].user_id;
      } else {
        const cpCheck = await query('SELECT user_id FROM client_profiles WHERE id = $1', [rawTarget]);
        if (cpCheck.rows.length > 0) {
          resolvedRecipientId = cpCheck.rows[0].user_id;
        }
      }
    }

    if (String(userId) === String(resolvedRecipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a conversation with yourself.'
      });
    }

    // Check if conversation already exists between these 2 users
    const existingSql = `
      SELECT cp1.conversation_id 
      FROM conversation_participants cp1
      JOIN conversation_participants cp2 
        ON cp1.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = $1 AND cp2.user_id = $2
      LIMIT 1;
    `;
    const existing = await query(existingSql, [userId, resolvedRecipientId]);

    let convId;
    let isNew = false;

    if (existing.rows.length > 0) {
      convId = existing.rows[0].conversation_id;
    } else {
      // Create new conversation
      const newConv = await query(
        'INSERT INTO conversations (project_id, created_at, last_message_at) VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        [projectId || null]
      );
      convId = newConv.rows[0].id;

      await query(
        `INSERT INTO conversation_participants (conversation_id, user_id, last_read_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP), ($1, $3, CURRENT_TIMESTAMP)`,
        [convId, userId, resolvedRecipientId]
      );
      isNew = true;
    }

    // Fetch conversation details to return
    const convDetailsSql = `
      SELECT 
        c.id,
        c.project_id,
        c.last_message_at AS updated_at,
        p_other.id AS other_user_id,
        p_other.name AS other_user_name,
        p_other.avatar_url AS other_user_avatar,
        p_other.role AS other_user_role,
        COALESCE(fp.title, cp.company_name, p_other.role) AS other_user_title
      FROM conversations c
      JOIN conversation_participants cp_other 
        ON c.id = cp_other.conversation_id AND cp_other.user_id != $1
      JOIN users p_other 
        ON cp_other.user_id = p_other.id
      LEFT JOIN freelancer_profiles fp ON p_other.id = fp.user_id
      LEFT JOIN client_profiles cp ON p_other.id = cp.user_id
      WHERE c.id = $2
      LIMIT 1;
    `;
    const detailsRes = await query(convDetailsSql, [userId, convId]);

    res.status(isNew ? 201 : 200).json({
      success: true,
      conversation_id: convId,
      conversation: detailsRes.rows[0] || { id: convId },
      isNew
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: conversationId } = req.params;

    // Verify participation
    const partCheck = await query(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (partCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.'
      });
    }

    // Update last_read_at
    await query(
      'UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    const sql = `
      SELECT m.id, m.conversation_id, m.sender_id, m.body, m.created_at, m.read_at,
             u.name AS sender_name, u.avatar_url AS sender_avatar, u.role AS sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC;
    `;

    const result = await query(sql, [conversationId]);

    res.json({
      success: true,
      messages: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: conversationId } = req.params;

    await query(
      'UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    res.json({
      success: true,
      message: 'Marked conversation as read.'
    });
  } catch (error) {
    next(error);
  }
};
