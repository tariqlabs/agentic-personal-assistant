import { VectorRepository } from "../repositories/VectorRepository.js";
import { config } from "../config/index.js";
import { callOpenRouterChat } from "../llm/openRouterClient.js";
import {
  RAG_SYSTEM_PROMPT,
  RAG_QUESTIONS_PROMPT,
  buildContextMessage,
} from "../prompts/ragChat.js";

export class AgentService {
  constructor(vectorRepository = new VectorRepository()) {
    this.vectorRepository = vectorRepository;
  }

  async run({ sessionId = "default", message, history = [], useQuestionsModel = false, userId }) {
    console.log(`🤖 Running agent for: "${message}"`);

    const { llm } = config;

    if (!llm.apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const model = useQuestionsModel ? llm.questionsModel : llm.model;

    // RAG: top-k=6, context capped at ~6k chars for token optimization
    const namespace = userId ? String(userId) : undefined;
    const searchResults = await this.vectorRepository.search(message, 6, namespace);
    const context =
      searchResults
        ?.map((doc) => doc.pageContent)
        .join("\n\n---\n\n")
        .slice(0, 6000) || "";

    const systemPrompt = useQuestionsModel ? RAG_QUESTIONS_PROMPT : RAG_SYSTEM_PROMPT;
    const systemMessages = [
      { role: "system", content: systemPrompt },
      { role: "system", content: buildContextMessage(context) },
    ];

    const conversationMessages = history
      .filter((m) => m.role && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    const messages = [
      ...systemMessages,
      ...conversationMessages,
      { role: "user", content: message },
    ];

    const { content } = await callOpenRouterChat({
      model,
      messages,
      temperature: llm.temperature,
      maxTokens: 1024,
    });

    const output = typeof content === "string" ? content : String(content ?? "");

    console.log(`✅ Agent response: ${output.slice(0, 100)}...`);

    return { output };
  }
}
