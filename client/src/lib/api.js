const BASE_URL =
  import.meta.env.VITE_API_URL ?? "";

function getToken() {
  return localStorage.getItem("helpin_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// AUTH
export const authApi = {
  loginAnonymous: () => request("/api/auth/anonymous", { method: "POST" }),
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
  create: (data) => request("/api/sessions", { method: "POST", body: JSON.stringify(data) }),
  upcoming: () => request("/api/sessions/upcoming"),
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
