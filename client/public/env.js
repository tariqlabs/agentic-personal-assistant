// Runtime configuration for the frontend.
// In development we point directly to the local Express server.
window._env_ = window._env_ || {};
window._env_.VITE_API_URL = window._env_.VITE_API_URL || "http://localhost:3000";

