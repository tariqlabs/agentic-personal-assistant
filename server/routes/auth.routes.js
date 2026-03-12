import express from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/AuthController.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const router = express.Router();

router.post("/signup", authLimiter, AuthController.signup);
router.get("/verify", AuthController.verify);
router.post("/login", authLimiter, AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/request-password-reset", authLimiter, AuthController.requestPasswordReset);
router.post("/reset-password", authLimiter, AuthController.resetPassword);

export { router as authRoutes };
