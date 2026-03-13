import { fetchPublic } from "../../../shared/lib/apiClient.js";

export const authApi = {
  signup: (email, password, confirmPassword) =>
    fetchPublic("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword }),
    }),

  login: (email, password) =>
    fetchPublic("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  verify: (token) =>
    fetchPublic(`/api/auth/verify?token=${encodeURIComponent(token)}`),

  requestPasswordReset: (email) =>
    fetchPublic("/api/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password, confirmPassword) =>
    fetchPublic("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password, confirmPassword }),
    }),
};
