const { env } = require("../config/env");

const API_KEY = env.API_KEY;

/**
 * Validates the X-API-Key header on every inbound request.
 * The /api/health endpoint is intentionally exempted so uptime monitors
 * don't need to know the key.
 */
const requireApiKey = (req, res, next) => {
  // Skip for health-check
  if (req.path === "/api/health" || req.path === "/health") {
    return next();
  }

  // If no key is configured we fail open in development only
  if (!API_KEY) {
    if (env.NODE_ENV === "production") {
      console.error("API_KEY env var is not set in production!");
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    return next();
  }

  const provided = req.headers["x-api-key"];
  if (!provided || provided !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  next();
};

module.exports = { requireApiKey };
