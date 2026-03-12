import express from "express";
import { ExamController } from "../controllers/ExamController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/exams", authMiddleware, ExamController.list);
router.post("/exams", authMiddleware, ExamController.create);
router.post("/exams/generate-topic", authMiddleware, ExamController.generateTopic);
router.post("/exams/attempts/:attemptId/submit", authMiddleware, ExamController.submit);
router.get("/exams/attempts/:attemptId/results", authMiddleware, ExamController.results);
router.get("/exams/:id", authMiddleware, ExamController.get);
router.post("/exams/:id/generate", authMiddleware, ExamController.generate);
router.post("/exams/:id/start", authMiddleware, ExamController.start);

export { router as examRoutes };
