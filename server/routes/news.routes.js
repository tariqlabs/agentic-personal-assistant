import express from "express";
import { NewsController } from "../controllers/NewsController.js";

const router = express.Router();

router.get("/news", NewsController.list);

export { router as newsRoutes };
