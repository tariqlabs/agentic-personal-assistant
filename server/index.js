import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import os from "node:os";
import path from "node:path";
import { unlink } from "node:fs/promises";
import { runAgent } from "./agent.js";
import { ingestData } from "./ingest.js";

const app = express();
app.use(cors());
app.use(express.json());

// Multer for PDF uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      (file.originalname || "").toLowerCase().endsWith(".pdf");
    cb(isPdf ? null : new Error("Only PDF files are allowed"), isPdf);
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const answer = await runAgent({ message, sessionId });

    const output = answer?.output || answer?.text || "";

    if (!output || output.trim() === "") {
      return res.json({
        answer:
          "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?",
      });
    }

    res.json({ answer: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PDF ingestion endpoint
app.post("/api/ingest", upload.single("file"), async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ error: "Missing PDF file" });
    }

    await ingestData(req.file.path);
    await unlink(req.file.path).catch(() => undefined);

    return res.json({ ok: true });
  } catch (err) {
    if (req.file?.path) {
      await unlink(req.file.path).catch(() => undefined);
    }
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("🚀 Server running on port 3001"));
