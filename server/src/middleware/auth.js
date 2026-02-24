const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const JWT_SECRET = env.JWT_SECRET;

const authenticate = (req, res, next) => {
  // Standard header — or query param for sendBeacon (which can't set headers)
  const authHeader = req.headers.authorization;
  const rawToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : (req.query.token ?? null);

  if (!rawToken) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const payload = jwt.verify(rawToken, JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { authenticate, JWT_SECRET };
