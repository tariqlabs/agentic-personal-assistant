import { prisma } from "../db/prisma.js";

export class MessageRepository {
  async add(conversationId, role, content) {
    return prisma.message.create({
      data: { conversationId, role, content },
    });
  }

  async getRecent(conversationId, limit = 20) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }
}
