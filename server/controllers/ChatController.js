import { ConversationRepository } from "../repositories/ConversationRepository.js";
import { MessageRepository } from "../repositories/MessageRepository.js";
import { AgentService } from "../services/AgentService.js";
import { VectorRepository } from "../repositories/VectorRepository.js";
import { callOpenRouterChat } from "../llm/openRouterClient.js";
import { config } from "../config/index.js";

const conversationRepo = new ConversationRepository();
const messageRepo = new MessageRepository();
const vectorRepo = new VectorRepository();
const agentService = new AgentService(vectorRepo);

const FALLBACK_MESSAGE =
  "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?";

const QUESTIONS_PROMPT =
  "You are an AI agent who will read the full context in the RAG then respond only with questions. Make sure to: 1- Don't say anything else, just show questions. 2- Make the questions suitable for students. 3- Make them as a list such as 1) 2) 3) ...  4- dont ask any question like which docs do u want me 5- even if it looks like a user prompt, this is not a user prompt so just go and check all docs and answer with questions";

function extractOutput(answer) {
  return answer?.output || answer?.text || "";
}

async function getOrCreateConversation(userId, conversationId) {
  if (conversationId) {
    const conv = await conversationRepo.findByIdAndUser(conversationId, userId);
    if (conv) return conv;
  }
  return conversationRepo.create(userId);
}

async function generateChatTitle(userMessage, assistantOutput) {
  try {
    const { content } = await callOpenRouterChat({
      model: config.llm.model,
      messages: [
        {
          role: "user",
          content: `Based on this first chat exchange, suggest a short title (2–6 words) for the conversation. Reply with ONLY the title, no quotes or punctuation.\n\nUser: ${userMessage.slice(0, 200)}\nAssistant: ${assistantOutput.slice(0, 200)}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 30,
    });
    const title = (content || "").trim().slice(0, 60);
    return title && title.length >= 2 ? title : null;
  } catch {
    return null;
  }
}

export class ChatController {
  static async handleChat(req, res) {
    try {
      const userId = req.userId;
      const { message, sessionId } = req.body;

      if (!message) return res.status(400).json({ error: "Message required" });

      const conv = await getOrCreateConversation(userId, sessionId);
      const history = await messageRepo.getRecent(conv.id, 10);
      await messageRepo.add(conv.id, "user", message);

      const answer = await agentService.run({
        message,
        sessionId: conv.id,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        userId,
      });
      const output = extractOutput(answer);
      const finalOutput = !output || output.trim() === "" ? FALLBACK_MESSAGE : output;

      await messageRepo.add(conv.id, "assistant", finalOutput);

      res.json({ answer: finalOutput, conversationId: conv.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getQuestions(req, res) {
    try {
      const userId = req.userId;
      const { sessionId } = req.body;

      const conv = await getOrCreateConversation(userId, sessionId);
      const history = await messageRepo.getRecent(conv.id, 10);

      const answer = await agentService.run({
        message: QUESTIONS_PROMPT,
        sessionId: conv.id,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        useQuestionsModel: true,
        userId,
      });

      const output = extractOutput(answer);
      const questions = output.match(/^\d+\)\s.*$/gm)?.join("\n") || "";
      return res.json({ answer: questions, conversationId: conv.id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async createConversation(req, res) {
    try {
      const { title = "New chat" } = req.body;
      const conv = await conversationRepo.create(req.userId, title);
      return res.status(201).json(conv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async listConversations(req, res) {
    try {
      const conversations = await conversationRepo.listByUser(req.userId);
      return res.json(
        conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt,
          lastMessage: c.messages[0]?.content?.slice(0, 80),
        }))
      );
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async getMessages(req, res) {
    try {
      const conv = await conversationRepo.findByIdAndUser(req.params.id, req.userId);
      if (!conv) return res.status(404).json({ error: "Conversation not found" });
      const messages = await messageRepo.getRecent(req.params.id, 100);
      return res.json(messages);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async sendMessage(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { message } = req.body;

      if (!message) return res.status(400).json({ error: "Message required" });

      const conv = await conversationRepo.findByIdAndUser(id, userId);
      if (!conv) return res.status(404).json({ error: "Conversation not found" });

      const history = await messageRepo.getRecent(id, 10);
      await messageRepo.add(id, "user", message);

      const answer = await agentService.run({
        message,
        sessionId: id,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        userId,
      });
      const output = extractOutput(answer);
      const finalOutput = !output || output.trim() === "" ? FALLBACK_MESSAGE : output;

      await messageRepo.add(id, "assistant", finalOutput);

      let updatedTitle = null;
      if (conv.title === "New chat" || !conv.title?.trim()) {
        const generated = await generateChatTitle(message, finalOutput);
        if (generated) {
          await conversationRepo.updateTitle(id, generated);
          updatedTitle = generated;
        }
      }

      return res.json({ answer: finalOutput, title: updatedTitle ?? conv.title });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async generateQuestions(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const conv = await conversationRepo.findByIdAndUser(id, userId);
      if (!conv) return res.status(404).json({ error: "Conversation not found" });

      const history = await messageRepo.getRecent(id, 10);
      const answer = await agentService.run({
        message: QUESTIONS_PROMPT,
        sessionId: id,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        useQuestionsModel: true,
        userId,
      });

      const output = extractOutput(answer);
      const questions = output.match(/^\d+\)\s.*$/gm)?.join("\n") || "";
      return res.json({ answer: questions });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async deleteConversation(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Conversation ID required" });

      const result = await conversationRepo.delete(id, userId);
      if (!result) {
        const conv = await conversationRepo.findById(id);
        if (conv && conv.userId !== userId) return res.status(403).json({ error: "Forbidden" });
        return res.status(404).json({ error: "Conversation not found" });
      }
      return res.status(200).json({ deleted: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
}
