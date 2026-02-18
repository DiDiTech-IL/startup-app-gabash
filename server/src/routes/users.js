const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/me
router.get("/users/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/preferences
router.put("/users/preferences", authenticate, async (req, res, next) => {
  const schema = z.object({
    strongSubjects: z.array(z.string()).optional(),
    weakSubjects: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: parsed.data,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard
router.get("/leaderboard", authenticate, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        avatarColor: true,
        points: true,
        volunteerHours: true,
        school: true,
        grade: true,
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
