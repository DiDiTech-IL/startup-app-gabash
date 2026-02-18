const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/safety/reports
router.post("/safety/reports", authenticate, async (req, res, next) => {
  const schema = z.object({
    type: z.string().min(1),
    targetUserId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const report = await prisma.safetyReport.create({
      data: {
        reporterId: req.user.id,
        type: parsed.data.type,
        targetUserId: parsed.data.targetUserId || null,
      },
    });
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
