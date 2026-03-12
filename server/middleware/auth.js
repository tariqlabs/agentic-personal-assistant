import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = authService.verifyAccessToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = userId;
  next();
}
