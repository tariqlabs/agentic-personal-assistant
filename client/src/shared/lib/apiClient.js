const API_BASE =
  (typeof window !== "undefined" && window._env_?.VITE_API_URL) ||
  import.meta.env?.VITE_API_URL ||
  "http://localhost:3000";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function logout(reason) {
  clearTokens();
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  window.location.href = `/auth/login${params}`;
}

export async function fetchWithAuth(url, options = {}, retry = true) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const { signal, ...restOptions } = options;
  const res = await fetch(`${API_BASE}${url}`, { ...restOptions, headers, signal });

  if (res.status === 401 && retry) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setTokens(data.accessToken, data.refreshToken);
        return fetchWithAuth(url, options, false);
      }
    }
    logout("Session expired. Please sign in again.");
    throw new Error("Session expired");
  }

  return res;
}

export function fetchPublic(url, options = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
}

export function fetchWithToken(url, options = {}) {
  const token = getAccessToken();
  return fetch(`${API_BASE}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}`, ...options.headers } : options.headers || {},
    ...options,
  });
}

export { API_BASE, getAccessToken, getRefreshToken, setTokens, clearTokens };
