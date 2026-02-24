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

function emitApiErrorToast(message, status) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("helpin:api-error", {
      detail: { message, status },
    })
  );
}

function extractErrorMessage(body, fallback) {
  if (!body) return fallback;
  if (typeof body.error === "string" && body.error.trim()) return body.error;

  if (Array.isArray(body.error) && body.error.length > 0) {
    const first = body.error[0];
    if (typeof first === "string") return first;
    if (first?.message) return first.message;
  }

  if (typeof body.message === "string" && body.message.trim()) return body.message;
  return fallback;
}

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
      const message = extractErrorMessage(body, `HTTP ${res.status}`);
      const err = new Error(message);
      err.status = res.status;
      emitApiErrorToast(message, res.status);
      throw err;
    }

    return res.json();
  } catch (error) {
    if (error.name === "AbortError") {
      const message = "Request timed out. Please try again.";
      emitApiErrorToast(message, 408);
      throw new Error(message);
    }
    if (error?.message) emitApiErrorToast(error.message, error.status);
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
  delete: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
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
  create: (data) => request("/api/sessions", { method: "POST", body: JSON.stringify(data) }),
  list: () => request("/api/sessions"),
  upcoming: () => request("/api/sessions/upcoming"),
  complete: (id) => request(`/api/sessions/${id}/complete`, { method: "POST" }),
  cancel: (id) => request(`/api/sessions/${id}`, { method: "DELETE" }),
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

// LIBRARY
export const libraryApi = {
  subjects: () => request("/api/library/subjects"),
  resources: async (subject, scope = "all") => {
    const search = new URLSearchParams();
    if (subject) search.set("subject", subject);
    if (scope) search.set("scope", scope);

    const result = await request(
      `/api/library/resources${search.toString() ? `?${search.toString()}` : ""}`
    );

    if (Array.isArray(result)) return result;
    if (!result?.ok) throw new Error("Library response was not successful");

    const resources = Array.isArray(result.resources) ? result.resources : [];
    const uniqueById = new Map(resources.map((item) => [item.id, item]));
    return Array.from(uniqueById.values());
  },
  addResource: (data) =>
    request("/api/library/resources", { method: "POST", body: JSON.stringify(data) }),
};
