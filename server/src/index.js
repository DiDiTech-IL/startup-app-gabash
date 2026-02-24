require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { requireApiKey } = require("./middleware/apiKey");
const { env } = require("./config/env");
const { prisma } = require("./lib/prisma");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const matchRoutes = require("./routes/matches");
const threadRoutes = require("./routes/threads");
const sessionRoutes = require("./routes/sessions");
const rewardRoutes = require("./routes/rewards");
const safetyRoutes = require("./routes/safety");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = env.PORT;

app.set("trust proxy", 1);

const corsOrigins = env.CORS_ORIGINS;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(limiter);
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API key guard – must come before all routes
app.use(requireApiKey);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use("/api", matchRoutes);
app.use("/api", threadRoutes);
app.use("/api", sessionRoutes);
app.use("/api", rewardRoutes);
app.use("/api", safetyRoutes);
app.use("/api/ai", aiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 HelpIN server running on port ${PORT}`);
});

const gracefulShutdown = async () => {
  console.log("Received shutdown signal, closing resources...");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
