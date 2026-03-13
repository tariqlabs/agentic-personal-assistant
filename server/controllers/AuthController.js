import { AuthService } from "../services/AuthService.js";
import {
  signupSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  refreshSchema,
} from "../validation/authSchemas.js";

const authService = new AuthService();

export class AuthController {
  static async signup(req, res) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const result = await authService.signup(parsed.data);
      return res.status(201).json(result);
    } catch (err) {
      if (err.message === "Email already registered") {
        return res.status(409).json({ error: err.message });
      }
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async verify(req, res) {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ error: "Token required" });
      }
      const result = await authService.verifyEmail(token);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const result = await authService.login(parsed.data);
      return res.json(result);
    } catch (err) {
      if (err.message === "Invalid email or password") {
        return res.status(401).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  static async refresh(req, res) {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const result = await authService.refresh(parsed.data.refreshToken);
      return res.json(result);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  static async requestPasswordReset(req, res) {
    try {
      const parsed = requestResetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const result = await authService.requestPasswordReset(parsed.data.email);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const result = await authService.resetPassword(parsed.data);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}
