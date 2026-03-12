import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { UserRepository } from "../repositories/UserRepository.js";
import { config } from "../config/index.js";

const SALT_ROUNDS = 12;

export class AuthService {
  constructor(userRepo = new UserRepository()) {
    this.userRepo = userRepo;
  }

  async hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  generateAccessToken(userId) {
    return jwt.sign(
      { sub: userId, type: "access" },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { sub: userId, type: "refresh" },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  verifyAccessToken(token) {
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret);
      return payload.sub;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token) {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret);
      return payload.sub;
    } catch {
      return null;
    }
  }

  generateSecureToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  async signup({ email, password }) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }
    const passwordHash = await this.hashPassword(password);
    const user = await this.userRepo.create({ email, passwordHash });

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.userRepo.createVerificationToken(user.id, token, expiresAt);

    // Stub: log verification URL for dev (no real email sender yet)
    const verifyUrl = `${process.env.APP_URL || "http://localhost:5173"}/auth/verify?token=${token}`;
    console.log(`[Auth] Verification URL for ${email}: ${verifyUrl}`);

    return {
      user: { id: user.id, email: user.email, isVerified: user.isVerified },
      accessToken: this.generateAccessToken(user.id),
      refreshToken: this.generateRefreshToken(user.id),
      message: "Please verify your email. Check console for verification URL in dev.",
    };
  }

  async verifyEmail(token) {
    const record = await this.userRepo.findVerificationToken(token);
    if (!record) throw new Error("Invalid or expired verification token");
    if (record.usedAt) throw new Error("Token already used");
    if (record.expiresAt < new Date()) throw new Error("Token expired");

    await this.userRepo.markVerificationTokenUsed(record.id);
    await this.userRepo.markVerified(record.userId);

    return { user: await this.userRepo.findById(record.userId) };
  }

  async login({ email, password }) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");
    const valid = await this.verifyPassword(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    return {
      user: { id: user.id, email: user.email, isVerified: user.isVerified },
      accessToken: this.generateAccessToken(user.id),
      refreshToken: this.generateRefreshToken(user.id),
    };
  }

  async refresh(refreshToken) {
    const userId = this.verifyRefreshToken(refreshToken);
    if (!userId) throw new Error("Invalid or expired refresh token");
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken: this.generateRefreshToken(user.id),
    };
  }

  async requestPasswordReset(email) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return { message: "If the email exists, a reset link has been sent" };

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await this.userRepo.createResetToken(user.id, token, expiresAt);

    const resetUrl = `${process.env.APP_URL || "http://localhost:5173"}/auth/reset-password?token=${token}`;
    console.log(`[Auth] Password reset URL for ${email}: ${resetUrl}`);

    return { message: "If the email exists, a reset link has been sent" };
  }

  async resetPassword({ token, password }) {
    const record = await this.userRepo.findResetToken(token);
    if (!record) throw new Error("Invalid or expired reset token");
    if (record.usedAt) throw new Error("Token already used");
    if (record.expiresAt < new Date()) throw new Error("Token expired");

    const passwordHash = await this.hashPassword(password);
    await this.userRepo.updatePassword(record.userId, passwordHash);
    await this.userRepo.markResetTokenUsed(record.id);

    return { message: "Password updated successfully" };
  }
}
