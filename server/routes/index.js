import express from "express";
import { authRoutes } from "./auth.routes.js";
import { chatRoutes } from "./chat.routes.js";
import { examRoutes } from "./exam.routes.js";
import { newsRoutes } from "./news.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use(chatRoutes);
router.use(examRoutes);
router.use(newsRoutes);

export { router };
