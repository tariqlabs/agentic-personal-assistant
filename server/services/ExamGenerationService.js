import { VectorRepository } from "../repositories/VectorRepository.js";
import { callOpenRouterChat } from "../llm/openRouterClient.js";
import { prisma } from "../db/prisma.js";
import { config } from "../config/index.js";
import { jsonrepair } from "jsonrepair";
import {
  EXAM_GENERATION_SYSTEM,
  EXAM_BATCH_SYSTEM,
  buildExamGenerationPrompt,
  buildTopicExamBatchPrompt,
} from "../prompts/examGeneration.js";

const QUESTIONS_PER_BATCH = 5;
const BATCH_COUNT = 6;
const MAX_RETRIES = 2;

export class ExamGenerationService {
  constructor(vectorRepository = new VectorRepository()) {
    this.vectorRepository = vectorRepository;
  }

  async generateExam(userId, title, existingExamId) {
    const searchQuery =
      "key concepts, definitions, important facts, and topics for exam questions";
    const namespace = userId ? String(userId) : undefined;
    const chunks = await this.vectorRepository.search(
      searchQuery,
      10,
      namespace
    );
    const context =
      chunks
        ?.map((doc) => doc.pageContent)
        .join("\n\n---\n\n")
        .slice(0, 8000) || "";

    if (!context || context.trim().length < 100) {
      throw new Error(
        "Insufficient content in your knowledge base. Please upload more documents before generating an exam."
      );
    }

    const { llm } = config;
    if (!llm.apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const examModel = llm.examModel || llm.model;
    const userPrompt = buildExamGenerationPrompt(context);
    const { content } = await callOpenRouterChat({
      model: examModel,
      messages: [
        { role: "system", content: EXAM_GENERATION_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 16384,
    });

    const raw = typeof content === "string" ? content : String(content ?? "");
    const parsed = this._parseQuestions(raw);
    if (!parsed.questions || parsed.questions.length === 0) {
      throw new Error(
        "Failed to generate valid questions. Please try again or add more documents."
      );
    }

    let exam;
    if (existingExamId) {
      exam = await prisma.exam.findFirst({
        where: { id: existingExamId, userId },
      });
      if (!exam) throw new Error("Exam not found");
      await prisma.examQuestion.deleteMany({ where: { examId: existingExamId } });
    } else {
      exam = await prisma.exam.create({
        data: {
          userId,
          title: title || "Generated Exam",
          status: "draft",
        },
      });
    }

    const questionsToCreate = parsed.questions.slice(0, 30).map((q, i) => ({
      examId: exam.id,
      questionText: q.questionText || "Question",
      options: Array.isArray(q.options) ? q.options : [],
      correctOptionId: q.correctOptionId || "A",
      orderIndex: i,
    }));

    await prisma.examQuestion.createMany({
      data: questionsToCreate,
    });

    return { examId: exam.id };
  }

  async generateTopicExam(userId, topicSlug, title) {
    const { llm } = config;
    if (!llm.apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const exam = await prisma.exam.create({
      data: {
        userId,
        title: title || `${topicSlug} Exam`,
        status: "draft",
      },
    });

    const examModel = llm.examModel || llm.model;
    console.log(`[ExamGenerationService] Using model: ${examModel} for topic "${topicSlug}"`);

    const allQuestions = [];
    for (let batchIdx = 0; batchIdx < BATCH_COUNT; batchIdx++) {
      let lastError = null;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const userPrompt = buildTopicExamBatchPrompt(topicSlug, batchIdx, BATCH_COUNT);
          console.log(`[ExamGenerationService] Batch ${batchIdx + 1}/${BATCH_COUNT}, attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
          const { content } = await callOpenRouterChat({
            model: examModel,
            messages: [
              { role: "system", content: EXAM_BATCH_SYSTEM },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            maxTokens: 4096,
          });

          const raw = typeof content === "string" ? content : String(content ?? "");
          if (!raw || raw.length < 50 || raw.includes("[object Object]")) {
            throw new Error(`Invalid LLM response (length=${raw.length})`);
          }
          const parsed = this._parseQuestions(raw);
          if (parsed.questions?.length > 0) {
            console.log(`[ExamGenerationService] Batch ${batchIdx + 1} OK: ${parsed.questions.length} questions`);
            allQuestions.push(...parsed.questions.slice(0, QUESTIONS_PER_BATCH));
            break;
          }
          lastError = new Error("No questions parsed from response");
        } catch (err) {
          lastError = err;
          console.warn(`[ExamGenerationService] Batch ${batchIdx + 1}, attempt ${attempt + 1} failed:`, err?.message);
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
    }

    if (allQuestions.length === 0) {
      await prisma.exam.delete({ where: { id: exam.id } });
      throw new Error("Failed to generate valid questions. Please try again.");
    }

    const questionsToCreate = allQuestions.slice(0, QUESTIONS_PER_BATCH * BATCH_COUNT).map((q, i) => ({
      examId: exam.id,
      questionText: q.questionText || "Question",
      options: Array.isArray(q.options) ? q.options : [],
      correctOptionId: q.correctOptionId || "A",
      orderIndex: i,
    }));

    await prisma.examQuestion.createMany({
      data: questionsToCreate,
    });

    return { examId: exam.id };
  }

  _parseQuestions(raw) {
    if (!raw || typeof raw !== "string") return { questions: [] };
    let jsonStr = raw.trim();

    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();

    const questionsStart = jsonStr.indexOf('"questions"');
    if (questionsStart >= 0) {
      const objectStart = jsonStr.lastIndexOf("{", questionsStart);
      if (objectStart >= 0) {
        let depth = 0;
        let end = jsonStr.length;
        let lastCompleteQuestion = -1;
        for (let i = objectStart; i < jsonStr.length; i++) {
          if (jsonStr[i] === "{") depth++;
          if (jsonStr[i] === "}") {
            depth--;
            if (depth === 0) {
              end = i + 1;
              break;
            }
            if (depth === 1) lastCompleteQuestion = i + 1;
          }
        }
        jsonStr = jsonStr.slice(objectStart, end);
        if (depth > 0 && lastCompleteQuestion > objectStart) {
          jsonStr = jsonStr.slice(0, lastCompleteQuestion - objectStart) + "]}";
        }
      }
    } else {
      const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (braceMatch) jsonStr = braceMatch[0];
    }

    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

    const safeParse = (str) => {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed?.questions)) return parsed.questions;
        if (Array.isArray(parsed)) return parsed;
        return [];
      } catch {
        return [];
      }
    };

    let questions = safeParse(jsonStr);
    if (questions.length > 0) return { questions };

    try {
      const repaired = jsonrepair(jsonStr);
      questions = safeParse(repaired);
      if (questions.length > 0) return { questions };
    } catch {
    }

    const questionMatches =
      jsonStr.match(/\{\s*"questionText"[\s\S]*?\}\s*(?=,|\]|\})/g) || [];
    if (questionMatches.length > 0) {
      const extracted = [];
      for (const match of questionMatches) {
        try {
          const fixed = jsonrepair(match);
          const obj = JSON.parse(fixed);
          if (obj && typeof obj === "object" && obj.questionText) {
            extracted.push(obj);
          }
        } catch {
        }
      }
      if (extracted.length > 0) {
        console.warn(
          "[ExamGenerationService] Fallback extracted",
          extracted.length,
          "questions from partial JSON"
        );
        return { questions: extracted };
      }
    }

    console.warn(
      "[ExamGenerationService] JSON parse failed. Raw snippet:",
      jsonStr.slice(0, 300)
    );
    return { questions: [] };
  }
}
