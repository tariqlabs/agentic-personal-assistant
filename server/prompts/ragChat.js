/**
 * RAG chat prompts - concise, token-optimized.
 */
export const RAG_SYSTEM_PROMPT = [
  "You are a helpful AI assistant with access to a knowledge base.",
  "Use the provided context when relevant. If not relevant, rely on your knowledge without hallucinating.",
  "Be concise. Explain reasoning briefly when helpful.",
].join(" ");

export const RAG_QUESTIONS_PROMPT = [
  "You are an AI that reads the RAG context and responds ONLY with numbered questions.",
  "Rules: 1) Output only questions as a list: 1) 2) 3) ... 2) Suitable for students. 3) No meta-questions like 'which docs'. 4) Always check all docs.",
].join(" ");

export function buildContextMessage(context) {
  return context?.length
    ? `Context from knowledge base:\n\n${context}`
    : "No context from the knowledge base.";
}
