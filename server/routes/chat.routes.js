import express from "express";
import { ChatController } from "../controllers/ChatController.js";
import { IngestionController } from "../controllers/IngestionController.js";
import { createUploadMiddleware } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const upload = createUploadMiddleware();

router.post("/chat/ask", authMiddleware, ChatController.handleChat);
router.post("/chat/get_questions", authMiddleware, ChatController.getQuestions);
router.post("/ingest", authMiddleware, upload.single("file"), IngestionController.handleIngestion);

router.post("/conversations", authMiddleware, ChatController.createConversation);
router.get("/conversations", authMiddleware, ChatController.listConversations);
router.delete("/conversations/:id", authMiddleware, ChatController.deleteConversation);
router.get("/conversations/:id/messages", authMiddleware, ChatController.getMessages);
router.post("/conversations/:id/messages", authMiddleware, ChatController.sendMessage);
router.post("/conversations/:id/questions", authMiddleware, ChatController.generateQuestions);

export { router as chatRoutes };
