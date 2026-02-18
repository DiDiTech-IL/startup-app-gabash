require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const matchRoutes = require("./routes/matches");
const threadRoutes = require("./routes/threads");
const sessionRoutes = require("./routes/sessions");
const rewardRoutes = require("./routes/rewards");
const safetyRoutes = require("./routes/safety");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use("/api", matchRoutes);
app.use("/api", threadRoutes);
app.use("/api", sessionRoutes);
app.use("/api", rewardRoutes);
app.use("/api", safetyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HelpIN server running on port ${PORT}`);
});
