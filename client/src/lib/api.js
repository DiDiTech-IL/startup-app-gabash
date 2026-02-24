const BASE_URL =
  import.meta.env.VITE_API_URL ?? "";
const REQUEST_TIMEOUT_MS = 12_000;

if (import.meta.env.PROD && !BASE_URL) {
  throw new Error("VITE_API_URL must be set in production");
}

function getToken() {
  return localStorage.getItem("helpin_token");
}

const API_KEY = import.meta.env.VITE_API_KEY ?? "";

async function request(path, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(API_KEY ? { "x-api-key": API_KEY } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      const err = new Error(body.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return res.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// AUTH
export const authApi = {
  signup: (data) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  signin: (data) => request("/api/auth/signin", { method: "POST", body: JSON.stringify(data) }),
};

// USERS
export const usersApi = {
  me: () => request("/api/users/me"),
  updatePreferences: (data) =>
    request("/api/users/preferences", { method: "PUT", body: JSON.stringify(data) }),
  leaderboard: () => request("/api/leaderboard"),
};

// POSTS
export const postsApi = {
  list: () => request("/api/posts"),
  create: (data) => request("/api/posts", { method: "POST", body: JSON.stringify(data) }),
  like: (id) => request(`/api/posts/${id}/like`, { method: "POST" }),
  comment: (id, data) =>
    request(`/api/posts/${id}/comments`, { method: "POST", body: JSON.stringify(data) }),
};

// MATCHES
export const matchesApi = {
  list: () => request("/api/matches"),
};

// THREADS / CHAT
export const threadsApi = {
  create: (data) => request("/api/threads", { method: "POST", body: JSON.stringify(data) }),
  messages: (id) => request(`/api/threads/${id}/messages`),
  sendMessage: (id, data) =>
    request(`/api/threads/${id}/messages`, { method: "POST", body: JSON.stringify(data) }),
};

// SESSIONS
export const sessionsApi = {
  list: () => request("/api/sessions"),
  create: (data) => request("/api/sessions", { method: "POST", body: JSON.stringify(data) }),
  upcoming: () => request("/api/sessions"),
  complete: (id) => request(`/api/sessions/${id}/complete`, { method: "POST" }),
};

// REWARDS
export const rewardsApi = {
  list: () => request("/api/rewards"),
  redeem: (data) => request("/api/rewards/redeem", { method: "POST", body: JSON.stringify(data) }),
};

// SAFETY
export const safetyApi = {
  report: (data) =>
    request("/api/safety/reports", { method: "POST", body: JSON.stringify(data) }),
};
