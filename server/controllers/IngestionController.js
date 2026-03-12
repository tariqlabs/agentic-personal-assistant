import { unlink } from "node:fs/promises";
import { IngestionService } from "../services/IngestionService.js";
import { VectorRepository } from "../repositories/VectorRepository.js";

const vectorRepository = new VectorRepository();
const ingestionService = new IngestionService(vectorRepository);

export class IngestionController {
  static async handleIngestion(req, res) {
    try {
      if (!req.file?.path) {
        return res.status(400).json({ error: "Missing file" });
      }

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      await ingestionService.ingestFile(req.file.path, userId);
      await unlink(req.file.path).catch(() => undefined);

      return res.json({ ok: true });
    } catch (err) {
      if (req.file?.path) {
        await unlink(req.file.path).catch(() => undefined);
      }
      return res.status(500).json({ error: err.message });
    }
  }
}
