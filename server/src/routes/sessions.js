const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

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
      },
      include: {
        mentor: { select: { id: true, name: true, avatarColor: true } },
        student: { select: { id: true, name: true, avatarColor: true } },
      },
      orderBy: { startTime: "asc" },
    });
    res.json(sessions);
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

    if (session.status === "COMPLETED") {
      return res.status(400).json({ error: "Session already completed" });
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

module.exports = router;
