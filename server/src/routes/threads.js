const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/threads
router.post("/threads", authenticate, async (req, res, next) => {
  const schema = z.object({ partnerId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const { partnerId } = parsed.data;

    if (partnerId === req.user.id) {
      return res.status(400).json({ error: "Cannot start a chat with yourself" });
    }

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true },
    });

    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    // Find existing one-to-one thread between these two users
    const existing = await prisma.thread.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: req.user.id } } },
          { participants: { some: { userId: partnerId } } },
          { participants: { every: { userId: { in: [req.user.id, partnerId] } } } },
        ],
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
      },
    });

    if (existing) {
      const otherParticipants = existing.participants.filter(
        (p) => p.userId !== req.user.id
      );
      // Verify partner is in thread
      if (otherParticipants.some((p) => p.userId === partnerId)) {
        return res.json(existing);
      }
    }

    // Create new thread
    const thread = await prisma.thread.create({
      data: {
        participants: {
          create: [{ userId: req.user.id }, { userId: partnerId }],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
      },
    });

    res.status(201).json(thread);
  } catch (err) {
    next(err);
  }
});

// GET /api/threads/:id/messages
router.get("/threads/:id/messages", authenticate, async (req, res, next) => {
  try {
    const participant = await prisma.threadParticipant.findFirst({
      where: {
        threadId: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    });

    if (!participant) return res.status(403).json({ error: "Forbidden" });

    const messages = await prisma.message.findMany({
      where: { threadId: req.params.id },
      include: { sender: { select: { id: true, name: true, avatarColor: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/threads/:id/messages
router.post("/threads/:id/messages", authenticate, async (req, res, next) => {
  const schema = z.object({ text: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const participant = await prisma.threadParticipant.findFirst({
      where: {
        threadId: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    });

    if (!participant) return res.status(403).json({ error: "Forbidden" });

    const message = await prisma.message.create({
      data: { threadId: req.params.id, senderId: req.user.id, text: parsed.data.text },
      include: { sender: { select: { id: true, name: true, avatarColor: true } } },
    });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
