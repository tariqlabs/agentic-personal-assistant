import { ExamGenerationService } from "../services/ExamGenerationService.js";
import { VectorRepository } from "../repositories/VectorRepository.js";
import { prisma } from "../db/prisma.js";
import { createExamSchema, submitExamSchema, generateTopicExamSchema } from "../validation/examSchemas.js";

const vectorRepo = new VectorRepository();
const examGenerationService = new ExamGenerationService(vectorRepo);

export class ExamController {
  static async create(req, res) {
    try {
      const userId = req.userId;
      const parsed = createExamSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const { title, generate } = parsed.data;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (generate) {
        const { examId } = await examGenerationService.generateExam(
          userId,
          title
        );
        const exam = await prisma.exam.findFirst({
          where: { id: examId, userId },
          include: { questions: true },
        });
        return res.status(201).json(exam);
      }

      const exam = await prisma.exam.create({
        data: { userId, title, status: "draft" },
      });
      return res.status(201).json(exam);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async generateTopic(req, res) {
    try {
      const userId = req.userId;
      const parsed = generateTopicExamSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const { topic, title } = parsed.data;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const displayTitle = title || `${topic.charAt(0).toUpperCase() + topic.slice(1)} Exam`;
      const { examId } = await examGenerationService.generateTopicExam(
        userId,
        topic,
        displayTitle
      );
      const exam = await prisma.exam.findFirst({
        where: { id: examId, userId },
        include: { questions: true },
      });
      return res.status(201).json(exam);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async generate(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const exam = await prisma.exam.findFirst({
        where: { id, userId },
        include: { questions: true },
      });
      if (!exam) {
        return res.status(404).json({ error: "Exam not found" });
      }

      if (exam.questions?.length > 0) {
        return res.json(exam);
      }

      await examGenerationService.generateExam(userId, exam.title, id);
      const updated = await prisma.exam.findFirst({
        where: { id, userId },
        include: { questions: { orderBy: { orderIndex: "asc" } } },
      });
      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async get(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const exam = await prisma.exam.findFirst({
        where: { id, userId },
        include: {
          questions: { orderBy: { orderIndex: "asc" } },
        },
      });
      if (!exam) {
        return res.status(404).json({ error: "Exam not found" });
      }
      return res.json(exam);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async list(req, res) {
    try {
      const userId = req.userId;
      const exams = await prisma.exam.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { questions: true } },
          attempts: {
            where: { completedAt: { not: null } },
            orderBy: { completedAt: "desc" },
            take: 1,
            select: { score: true, correctCount: true, totalQuestions: true, completedAt: true },
          },
        },
      });
      const mapped = exams.map((e) => {
        const lastAttempt = e.attempts[0] || null;
        return {
          id: e.id,
          title: e.title,
          status: e.status,
          createdAt: e.createdAt,
          questionCount: e._count.questions,
          lastScore: lastAttempt?.score ?? null,
          lastCorrect: lastAttempt?.correctCount ?? null,
          lastTotal: lastAttempt?.totalQuestions ?? null,
          completedAt: lastAttempt?.completedAt ?? null,
        };
      });
      return res.json(mapped);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async start(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const exam = await prisma.exam.findFirst({
        where: { id, userId },
        include: { questions: true },
      });
      if (!exam) {
        return res.status(404).json({ error: "Exam not found" });
      }
      if (exam.questions.length === 0) {
        return res
          .status(400)
          .json({
            error: "Exam has no questions. Generate questions first.",
          });
      }

      const attempt = await prisma.examAttempt.create({
        data: {
          examId: id,
          userId,
          totalQuestions: exam.questions.length,
          correctCount: 0,
        },
      });

      await prisma.exam.update({
        where: { id },
        data: { status: "in_progress" },
      });

      return res.json({
        attemptId: attempt.id,
        examId: id,
        totalQuestions: exam.questions.length,
        questions: exam.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          orderIndex: q.orderIndex,
        })),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async submit(req, res) {
    try {
      const userId = req.userId;
      const { attemptId } = req.params;
      const parsed = submitExamSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const { answers } = parsed.data;

      const attempt = await prisma.examAttempt.findFirst({
        where: { id: attemptId, userId },
        include: {
          exam: { include: { questions: true } },
        },
      });
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      if (attempt.completedAt) {
        return res.status(400).json({ error: "Attempt already submitted" });
      }

      const questionsMap = new Map(
        attempt.exam.questions.map((q) => [q.id, q])
      );
      let correctCount = 0;

      for (const a of answers) {
        const q = questionsMap.get(a.examQuestionId);
        if (!q) continue;
        const isCorrect = a.selectedOptionId === q.correctOptionId;
        if (isCorrect) correctCount++;
        await prisma.userExamAnswer.create({
          data: {
            examAttemptId: attemptId,
            examQuestionId: a.examQuestionId,
            selectedOptionId: a.selectedOptionId,
            isCorrect,
          },
        });
      }

      const score = Math.round((correctCount / attempt.totalQuestions) * 100);
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          correctCount,
          score,
          completedAt: new Date(),
        },
      });

      await prisma.exam.update({
        where: { id: attempt.examId },
        data: { status: "completed" },
      });

      return res.json({
        score,
        correctCount,
        totalQuestions: attempt.totalQuestions,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async results(req, res) {
    try {
      const userId = req.userId;
      const { attemptId } = req.params;

      const attempt = await prisma.examAttempt.findFirst({
        where: { id: attemptId, userId },
        include: {
          exam: true,
          answers: {
            include: {
              examQuestion: true,
            },
          },
        },
      });
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      const results = attempt.answers.map((a) => ({
        examQuestionId: a.examQuestionId,
        questionText: a.examQuestion.questionText,
        options: a.examQuestion.options,
        correctOptionId: a.examQuestion.correctOptionId,
        selectedOptionId: a.selectedOptionId,
        isCorrect: a.isCorrect,
      }));

      return res.json({
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        examTitle: attempt.exam.title,
        results,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
}
