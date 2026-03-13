import { fetchWithAuth, getAccessToken, API_BASE } from "../../../shared/lib/apiClient.js";

export const chatApi = {
  getConversations: () => fetchWithAuth("/api/conversations"),

  createConversation: (title = "New chat") =>
    fetchWithAuth("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  getMessages: (conversationId) =>
    fetchWithAuth(`/api/conversations/${conversationId}/messages`),

  deleteConversation: (conversationId) =>
    fetchWithAuth(`/api/conversations/${conversationId}`, { method: "DELETE" }),

  sendMessage: (conversationId, message) =>
    fetchWithAuth(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  generateQuestions: (conversationId) =>
    fetchWithAuth(`/api/conversations/${conversationId}/questions`, { method: "POST" }),

  ingest: (file) => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE}/api/ingest`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  },
};
