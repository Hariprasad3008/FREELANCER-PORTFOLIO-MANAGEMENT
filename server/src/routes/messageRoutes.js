import { Router } from 'express';
import {
  getConversations,
  createOrGetConversation,
  getMessages,
  markAsRead
} from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/conversations', getConversations);
router.post('/conversations', createOrGetConversation);
router.get('/conversations/with/:recipientId', createOrGetConversation);
router.get('/direct/:recipientId', createOrGetConversation);
router.post('/direct', createOrGetConversation);
router.get('/conversations/:id/messages', getMessages);
router.put('/conversations/:id/read', markAsRead);

export default router;
