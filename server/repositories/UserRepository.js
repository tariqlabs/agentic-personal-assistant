import { prisma } from "../db/prisma.js";

export class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create({ email, passwordHash }) {
    return prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: passwordHash,
      },
    });
  }

  async markVerified(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  async updatePassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }

  async createVerificationToken(userId, token, expiresAt) {
    return prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findVerificationToken(token) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async markVerificationTokenUsed(tokenId) {
    return prisma.emailVerificationToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  async createResetToken(userId, token, expiresAt) {
    return prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findResetToken(token) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async markResetTokenUsed(tokenId) {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }
}
