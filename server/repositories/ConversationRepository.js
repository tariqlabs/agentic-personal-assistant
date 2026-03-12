import { prisma } from "../db/prisma.js";

export class ConversationRepository {
  async create(userId, title = "New chat") {
    return prisma.conversation.create({
      data: { userId, title },
    });
  }

  async listByUser(userId) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findById(conversationId) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
    });
  }

  async findByIdAndUser(conversationId, userId) {
    return prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
  }

  async updateTitle(conversationId, title) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async delete(conversationId, userId) {
    const conv = await this.findByIdAndUser(conversationId, userId);
    if (!conv) return null;
    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });
    return { id: conversationId };
  }
}
