import { fetchPublic } from "../../../shared/lib/apiClient.js";

export const newsApi = {
  getNews: () => fetchPublic("/api/news"),
};
