const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function deriveSessionStatus(session) {
  if (session.status === "COMPLETED") return "COMPLETED";
  if (session.status === "CANCELED") return "CANCELED";

  const endTime = new Date(session.startTime).getTime() + session.durationMinutes * 60_000;
  if (endTime < Date.now()) return "PASSED";

  return "SCHEDULED";
}

function withSessionView(session, userId) {
  const role = session.studentId === userId ? "REQUESTED" : "INVITED";
  return {
    ...session,
    role,
    derivedStatus: deriveSessionStatus(session),
  };
}

// POST /api/sessions
router.post("/sessions", authenticate, async (req, res, next) => {
  const schema = z.object({
    partnerId: z.string(),
    subject: z.string().min(1),
    startTime: z.string().datetime(),
    durationMinutes: z.number().int().positive(),
    location: z.string().min(1),
    isMentor: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const { partnerId, subject, startTime, durationMinutes, location, isMentor } = parsed.data;

    if (partnerId === req.user.id) {
      return res.status(400).json({ error: "Cannot create a session with yourself" });
    }

    const session = await prisma.session.create({
      data: {
        mentorId: isMentor ? req.user.id : partnerId,
        studentId: isMentor ? partnerId : req.user.id,
        subject,
        startTime: new Date(startTime),
        durationMinutes,
        location,
      },
      include: {
        mentor: { select: { id: true, name: true, avatarColor: true } },
        student: { select: { id: true, name: true, avatarColor: true } },
      },
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/upcoming
router.get("/sessions/upcoming", authenticate, async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ mentorId: req.user.id }, { studentId: req.user.id }],
        status: "SCHEDULED",
        startTime: { gte: new Date() },
      },
      include: {
        mentor: { select: { id: true, name: true, avatarColor: true } },
        student: { select: { id: true, name: true, avatarColor: true } },
      },
      orderBy: { startTime: "asc" },
    });
    res.json(sessions.map((session) => withSessionView(session, req.user.id)));
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions
router.get("/sessions", authenticate, async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ mentorId: req.user.id }, { studentId: req.user.id }],
      },
      include: {
        mentor: { select: { id: true, name: true, avatarColor: true } },
        student: { select: { id: true, name: true, avatarColor: true } },
      },
      orderBy: { startTime: "desc" },
    });

    res.json(sessions.map((session) => withSessionView(session, req.user.id)));
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/complete
router.post("/sessions/:id/complete", authenticate, async (req, res, next) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (session.mentorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (session.status !== "SCHEDULED") {
      return res.status(400).json({ error: "Session cannot be completed" });
    }

    // Mark complete
    const updated = await prisma.session.update({
      where: { id: session.id },
      data: { status: "COMPLETED" },
    });

    // Award hours and points to mentor
    const hoursAwarded = Math.ceil(session.durationMinutes / 60);
    const pointsAwarded = hoursAwarded * 5;

    await prisma.user.update({
      where: { id: session.mentorId },
      data: {
        volunteerHours: { increment: hoursAwarded },
        points: { increment: pointsAwarded },
      },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.json({ session: updated, user: updatedUser });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sessions/:id
router.delete("/sessions/:id", authenticate, async (req, res, next) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (session.mentorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (session.status !== "SCHEDULED") {
      return res.status(400).json({ error: "Only scheduled sessions can be canceled" });
    }

    const updated = await prisma.session.update({
      where: { id: session.id },
      data: { status: "CANCELED" },
      include: {
        mentor: { select: { id: true, name: true, avatarColor: true } },
        student: { select: { id: true, name: true, avatarColor: true } },
      },
    });

    res.json(withSessionView(updated, req.user.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
