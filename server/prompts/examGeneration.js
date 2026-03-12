/**
 * Prompt for generating multiple-choice exam questions from RAG context.
 * Expects JSON output: { questions: [{ questionText, options: [{ id, text }], correctOptionId }] }
 */
export const EXAM_GENERATION_SYSTEM = `You are an exam question generator. Given context from a knowledge base, generate exactly 15 multiple-choice questions.

Rules:
1. Each question must have exactly 4 options (A, B, C, D).
2. Use option id "A", "B", "C", "D" for each option.
3. Only one option is correct per question.
4. Questions must be based ONLY on the provided context - do not invent facts.
5. Cover diverse topics from the context.
6. Keep option text concise (under 80 chars each) to fit token limits.
7. Return valid JSON only, no markdown or extra text.

Output format:
{
  "questions": [
    {
      "questionText": "What is...?",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B"
    }
  ]
}`;

/** Shorter system prompt for batch mode (5 questions per call). */
export const EXAM_BATCH_SYSTEM = `You are an exam question generator. Generate exactly 5 multiple-choice questions per request.

Rules:
1. Each question: exactly 4 options (A, B, C, D). Use only double quotes in JSON.
2. One correct option per question. correctOptionId: "A"|"B"|"C"|"D".
3. Keep option text under 80 chars. Return ONLY valid JSON, no markdown.

Output format: {"questions":[{"questionText":"...","options":[{"id":"A","text":"..."},...],"correctOptionId":"B"}]}`;

export function buildExamGenerationPrompt(context) {
  return `Generate exactly 15 multiple-choice questions based on the following context from the knowledge base.

Context:
---
${context.slice(0, 8000)}
---

Return ONLY valid JSON in the exact format specified.`;
}

/** Topic-specific exam prompt - no RAG, AI generates from domain knowledge. */
const TOPIC_CONTEXTS = {
  nodejs: "Node.js: event loop, EventEmitter, streams, modules (CommonJS/ESM), npm, async/await, callbacks, buffers, File System API, path module, child_process, cluster, debugging",
  linux: "Linux: shell commands (bash), file system, permissions (chmod, chown), processes, cron, systemd, networking (netstat, ssh), package managers (apt, yum), grep, sed, awk, pipes",
  react: "React: components, hooks (useState, useEffect, useContext), JSX, props, state, lifecycle, virtual DOM, reconciliation, React Router, context API, custom hooks",
  ai: "Artificial Intelligence: NLP, computer vision, neural networks, transformers, LLMs, prompt engineering, RAG, agents, embeddings, supervised/unsupervised learning",
  machinelearning: "Machine Learning: supervised vs unsupervised, regression, classification, neural networks, overfitting, cross-validation, feature engineering, scikit-learn, PyTorch/TensorFlow basics",
  javascript: "JavaScript: ES6+, async/await, closures, prototypes, promises, event loop, DOM APIs, fetch, modules, destructuring, spread operator, array methods",
  python: "Python: data structures, list comprehensions, decorators, context managers, async/await, typing, packaging (pip), virtual environments, pytest, classes",
  aws: "AWS: EC2, S3, Lambda, IAM, VPC, CloudWatch, RDS, DynamoDB, API Gateway, Step Functions, cost optimization",
  docker: "Docker: Dockerfile, images, containers, docker-compose, volumes, networks, multi-stage builds, best practices",
  kubernetes: "Kubernetes: pods, deployments, services, ConfigMaps, Secrets, ingress, kubectl, namespaces, helm",
};

export function buildTopicExamPrompt(topicSlug) {
  const context = TOPIC_CONTEXTS[topicSlug] || `General technical knowledge about ${topicSlug}`;
  return `Generate exactly 15 multiple-choice questions for a technical exam. Topic and key areas to cover:

${context}

Rules:
1. Each question must have exactly 4 options (A, B, C, D).
2. Use option id "A", "B", "C", "D" for each option.
3. Only one option is correct per question.
4. Questions should test practical knowledge and common scenarios.
5. Cover diverse subtopics within the domain.
6. Keep option text concise (under 80 chars each) to fit token limits.
7. Use only double quotes in JSON. Never use single quotes inside string values.
8. Return valid JSON only, no markdown or extra text.

Output format:
{
  "questions": [
    {
      "questionText": "What is...?",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B"
    }
  ]
}

Return ONLY valid JSON in the exact format specified.`;
}

/** Batch prompt: 5 questions per request to avoid truncation. */
export function buildTopicExamBatchPrompt(topicSlug, batchIndex, totalBatches) {
  const context = TOPIC_CONTEXTS[topicSlug] || `General technical knowledge about ${topicSlug}`;
  return `Generate exactly 5 multiple-choice questions for a technical exam. This is batch ${batchIndex + 1} of ${totalBatches} — cover DIFFERENT subtopics than other batches.

Topic and key areas: ${context}

Rules:
1. Each question must have exactly 4 options (A, B, C, D).
2. Use option id "A", "B", "C", "D" for each option.
3. Only one option is correct per question.
4. Use only double quotes in JSON. Never use single quotes inside string values.
5. Return valid JSON only, no markdown or extra text.

Output format: {"questions":[{"questionText":"...","options":[{"id":"A","text":"..."},...],"correctOptionId":"B"}]}

Return ONLY valid JSON.`;
}
