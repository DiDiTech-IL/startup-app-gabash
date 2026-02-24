const express = require("express");
const { z } = require("zod");
const { streamText } = require("ai");
const { authenticate } = require("../middleware/auth");
const { env } = require("../config/env");
const { prisma } = require("../lib/prisma");

const router = express.Router();

const MAX_MESSAGES_PER_HOUR = 20;
const rateLimitStore = new Map();

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

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT = `אתה "מורה בכיס" — עוזר לימודי חכם, חברותי ומעודד, שעוזר לתלמידי תיכון בישראל להצליח בלימודים ובבגרויות.

כללים חשובים:
• ענה תמיד בעברית, בשפה ברורה ומותאמת לגיל תיכון.
• פרק בעיות מורכבות לשלבים קטנים וממוספרים.
• השתמש בדוגמאות קונקרטיות מהחיים הישראליים כשרלוונטי.
• כשמדובר בחומר בגרות — ציין את הנושא הרלוונטי (מתמטיקה, אנגלית, היסטוריה, פיזיקה וכד').
• עודד ותמוך — תלמידים לפעמים לחוצים ומוצפים.
• אם שאלה חורגת לגמרי מתחום לימודים (משהו לא הולם, פוליטי, עצות רפואיות וכד') — סרב בנימוס והציע לחזור ללימודים.
• אל תכתוב תשובות ארוכות מדי — הישאר ממוקד וקצר.`;

router.post("/chat", authenticate, async (req, res, next) => {
  const { allowed, remaining, resetInMin } = checkRateLimit(req.user.id);
  if (!allowed) {
    return res.status(429).json({
      error: `הגעת למגבלה של ${MAX_MESSAGES_PER_HOUR} הודעות לשעה. נסה שוב בעוד ${resetInMin} דקות.`,
      resetInMin,
    });
  }

  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  try {
    const gatewayKey =
      env.AI_GATEWAY_API_KEY ||
      env.OPENAI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!gatewayKey) {
      const err = new Error(
        "AI_GATEWAY_API_KEY is not configured on the server.",
      );
      err.status = 503;
      throw err;
    }

    if (!process.env.AI_GATEWAY_API_KEY) {
      process.env.AI_GATEWAY_API_KEY = gatewayKey;
    }

    res.set({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "x-rate-limit-remaining": String(remaining),
      "x-rate-limit-max": String(MAX_MESSAGES_PER_HOUR),
    });

    const result = streamText({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...parsed.data.messages],
      maxOutputTokens: 800,
      temperature: 0.7,
    });

    req.on("close", () => {
      if (req.aborted && typeof result.abort === "function") {
        result.abort();
      }
    });

    result.pipeTextStreamToResponse(res);
  } catch (err) {
    if (!res.headersSent) return next(err);
    res.end();
  }
});

router.get("/status", authenticate, (req, res) => {
  const now = Date.now();
  const entry = rateLimitStore.get(req.user.id);
  const used = entry && now <= entry.resetAt ? entry.count : 0;
  const resetInMin =
    entry && now <= entry.resetAt
      ? Math.ceil((entry.resetAt - now) / 60_000)
      : 60;

  res.json({
    used,
    remaining: Math.max(0, MAX_MESSAGES_PER_HOUR - used),
    max: MAX_MESSAGES_PER_HOUR,
    resetInMin,
  });
});

// ─── Conversation persistence ─────────────────────────────────────────────────
const MAX_CONVERSATIONS_PER_USER = 10;

const saveSchema = z.object({
  conversationId: z.string().uuid().optional(),
  title: z.string().min(1).max(100),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1)
    .max(40),
});

// GET /api/ai/conversations — list (metadata only, no messages)
router.get("/conversations", authenticate, async (req, res, next) => {
  try {
    const conversations = await prisma.aiConversation.findMany({
      where: { userId: req.user.id },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_CONVERSATIONS_PER_USER,
    });
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/conversations — create or update
router.post("/conversations", authenticate, async (req, res, next) => {
  const parsed = saveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { conversationId, title, messages } = parsed.data;
  const userId = req.user.id;

  try {
    let conversation;

    if (conversationId) {
      // Update existing — verify ownership
      conversation = await prisma.aiConversation.updateMany({
        where: { id: conversationId, userId },
        data: { title, messages, updatedAt: new Date() },
      });
      if (conversation.count === 0) return res.status(404).json({ error: "לא נמצא" });
      res.json({ id: conversationId });
    } else {
      // Create new — enforce cap by deleting the oldest if needed
      const count = await prisma.aiConversation.count({ where: { userId } });
      if (count >= MAX_CONVERSATIONS_PER_USER) {
        const oldest = await prisma.aiConversation.findFirst({
          where: { userId },
          orderBy: { updatedAt: "asc" },
          select: { id: true },
        });
        if (oldest) await prisma.aiConversation.delete({ where: { id: oldest.id } });
      }
      conversation = await prisma.aiConversation.create({
        data: { userId, title, messages },
        select: { id: true },
      });
      res.status(201).json({ id: conversation.id });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/conversations/:id — full messages
router.get("/conversations/:id", authenticate, async (req, res, next) => {
  try {
    const convo = await prisma.aiConversation.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!convo) return res.status(404).json({ error: "לא נמצא" });
    res.json(convo);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ai/conversations/:id
router.delete("/conversations/:id", authenticate, async (req, res, next) => {
  try {
    const deleted = await prisma.aiConversation.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (deleted.count === 0) return res.status(404).json({ error: "לא נמצא" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;