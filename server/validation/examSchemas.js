import { z } from "zod";

export const createExamSchema = z.object({
  title: z.string().min(1).max(200).optional().default("Generated Exam"),
  generate: z.boolean().optional().default(false),
});

export const generateTopicExamSchema = z.object({
  topic: z.string().min(1).max(50),
  title: z.string().min(1).max(200).optional(),
});

export const submitExamSchema = z.object({
  answers: z.array(
    z.object({
      examQuestionId: z.string().min(1),
      selectedOptionId: z.string(),
    })
  ),
});
