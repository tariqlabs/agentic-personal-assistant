import { NewsService } from "../services/NewsService.js";

const newsService = new NewsService();

export class NewsController {
  static async list(req, res) {
    try {
      const items = await newsService.getNews();
      return res.json(items);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
}
