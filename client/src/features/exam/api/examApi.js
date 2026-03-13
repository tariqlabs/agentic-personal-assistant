import { fetchWithAuth } from "../../../shared/lib/apiClient.js";

export const examApi = {
  list: () => fetchWithAuth("/api/exams"),

  create: (title = "Generated Exam", generate = false) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    return fetchWithAuth("/api/exams", {
      method: "POST",
      body: JSON.stringify({ title, generate }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
  },

  createTopicExam: (topic, title) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);
    return fetchWithAuth("/api/exams/generate-topic", {
      method: "POST",
      body: JSON.stringify({ topic, title }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
  },

  get: (id) => fetchWithAuth(`/api/exams/${id}`),

  generate: (id) =>
    fetchWithAuth(`/api/exams/${id}/generate`, { method: "POST" }),

  start: (id) =>
    fetchWithAuth(`/api/exams/${id}/start`, { method: "POST" }),

  submitAnswers: (attemptId, answers) =>
    fetchWithAuth(`/api/exams/attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  getResults: (attemptId) =>
    fetchWithAuth(`/api/exams/attempts/${attemptId}/results`),
};
