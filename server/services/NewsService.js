import { prisma } from "../db/prisma.js";
import { callOpenRouterChat } from "../llm/openRouterClient.js";
import { config } from "../config/index.js";

const NEWS_PROMPT = `Generate 5 short news-style updates (2-3 sentences each) about recent AI and DevOps developments. They should be fictional but realistic. Return ONLY valid JSON in this exact format:
[
  { "title": "Headline", "content": "Brief summary.", "publishedAt": "2024-01-15" },
  ...
]
Use ISO date strings for publishedAt.`;

const CACHE_HOURS = 24;

export class NewsService {
  async getNews() {
    const cutoff = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000);
    const existing = await prisma.news.findMany({
      where: { createdAt: { gte: cutoff } },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });

    if (existing.length >= 3) {
      return existing.map((n) => ({
        title: n.title,
        content: n.content,
        publishedAt: n.publishedAt?.toISOString?.()?.slice(0, 10) ?? null,
      }));
    }

    try {
      const { llm } = config;
      if (!llm?.apiKey) {
        return existing.map((n) => ({
          title: n.title,
          content: n.content,
          publishedAt: n.publishedAt?.toISOString?.()?.slice(0, 10) ?? null,
        }));
      }

      const { content } = await callOpenRouterChat({
        model: llm.model,
        messages: [
          { role: "system", content: "You return only valid JSON, no markdown." },
          { role: "user", content: NEWS_PROMPT },
        ],
        temperature: 0.7,
        maxTokens: 1500,
      });

      const raw = typeof content === "string" ? content : String(content ?? "");
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const items = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      for (const item of items.slice(0, 5)) {
        await prisma.news.create({
          data: {
            title: item.title || "Update",
            content: item.content || "",
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
          },
        });
      }

      const all = await prisma.news.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return all.map((n) => ({
        title: n.title,
        content: n.content,
        publishedAt: n.publishedAt?.toISOString?.()?.slice(0, 10) ?? null,
      }));
    } catch (err) {
      console.error("NewsService.getNews error:", err);
      return existing.map((n) => ({
        title: n.title,
        content: n.content,
        publishedAt: n.publishedAt?.toISOString?.()?.slice(0, 10) ?? null,
      }));
    }
  }
}
