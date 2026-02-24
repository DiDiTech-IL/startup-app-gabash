const express = require("express");
const { z } = require("zod");
const { streamText } = require("ai");
const { createOpenAI } = require("@ai-sdk/openai");
const { authenticate } = require("../middleware/auth");
const { env } = require("../config/env");

const router = express.Router();

// Lazy-initialise the OpenAI client so the server starts without the key in dev
function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not configured on the server.");
    err.status = 503;
    throw err;
  }
  return createOpenAI({ apiKey: env.OPENAI_API_KEY });
}

// ─── Per-user in-memory rate limiter ────────────────────────────────────────
const MAX_MESSAGES_PER_HOUR = 20;
const rateLimitStore = new Map(); // userId -> { count, resetAt }

// Prune expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(userId);
  }
}, 10 * 60 * 1000);

function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return { allowed: true, remaining: MAX_MESSAGES_PER_HOUR - 1 };
  }

  if (entry.count >= MAX_MESSAGES_PER_HOUR) {
    const resetInMin = Math.ceil((entry.resetAt - now) / 60_000);
    return { allowed: false, remaining: 0, resetInMin };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_MESSAGES_PER_HOUR - entry.count };
}

// ─── Input schema ────────────────────────────────────────────────────────────
const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),  // hard cap on context window sent per request
});

// ─── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `אתה "מורה בכיס" — עוזר לימודי חכם, חברותי ומעודד, שעוזר לתלמידי תיכון בישראל להצליח בלימודים ובבגרויות.

כללים חשובים:
• ענה תמיד בעברית, בשפה ברורה ומותאמת לגיל תיכון.
• פרק בעיות מורכבות לשלבים קטנים וממוספרים.
• השתמש בדוגמאות קונקרטיות מהחיים הישראליים כשרלוונטי.
• כשמדובר בחומר בגרות — ציין את הנושא הרלוונטי (מתמטיקה, אנגלית, היסטוריה, פיזיקה וכד').
• עודד ותמוך — תלמידים לפעמים לחוצים ומוצפים.
• אם שאלה חורגת לגמרי מתחום לימודים (משהו לא הולם, פוליטי, עצות רפואיות וכד') — סרב בנימוס והציע לחזור ללימודים.
• אל תכתוב תשובות ארוכות מדי — הישאר ממוקד וקצר.`;

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
router.post("/chat", authenticate, async (req, res, next) => {
  // Rate limit check
  const { allowed, remaining, resetInMin } = checkRateLimit(req.user.id);
  if (!allowed) {
    return res.status(429).json({
      error: `הגעת למגבלה של ${MAX_MESSAGES_PER_HOUR} הודעות לשעה. נסה שוב בעוד ${resetInMin} דקות.`,
      resetInMin,
    });
  }

  // Input validation
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  try {
    const openai = getOpenAI();
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: parsed.data.messages,
      maxTokens: 800,
      temperature: 0.7,
    });

    // Stream in the Vercel AI SDK data-stream format
    // useChat on the client understands this protocol
    result.pipeDataStreamToResponse(res, {
      headers: {
        "x-rate-limit-remaining": String(remaining),
        "x-rate-limit-max": String(MAX_MESSAGES_PER_HOUR),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/ai/status ──────────────────────────────────────────────────────
// Returns the user's current rate-limit status without spending a message
router.get("/status", authenticate, (req, res) => {
  const now = Date.now();
  const entry = rateLimitStore.get(req.user.id);
  const used = entry && now <= entry.resetAt ? entry.count : 0;
  const resetInMin = entry && now <= entry.resetAt ? Math.ceil((entry.resetAt - now) / 60_000) : 60;
  res.json({
    used,
    remaining: Math.max(0, MAX_MESSAGES_PER_HOUR - used),
    max: MAX_MESSAGES_PER_HOUR,
    resetInMin,
  });
});

module.exports = router;
