import { Router } from "express";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/conversations", verifyToken, getConversations);
router.post("/conversations", verifyToken, getOrCreateConversation);
router.get("/conversations/:conversationId/messages", verifyToken, getMessages);
router.post("/conversations/:conversationId/messages", verifyToken, sendMessage);

export default router;
