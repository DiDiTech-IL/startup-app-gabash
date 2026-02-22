const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/rewards
router.get("/rewards", authenticate, async (req, res, next) => {
  try {
    const rewards = await prisma.reward.findMany();
    res.json(rewards);
  } catch (err) {
    next(err);
  }
});

// POST /api/rewards/redeem
router.post("/rewards/redeem", authenticate, async (req, res, next) => {
  const schema = z.object({ rewardId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const reward = await prisma.reward.findUnique({ where: { id: parsed.data.rewardId } });
    if (!reward) return res.status(404).json({ error: "Reward not found" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.points < reward.cost) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    const code = `COUPON-${Math.floor(1000 + Math.random() * 9000)}`;

    // Subtract points and create redemption in a transaction
    const [updatedUser, redemption] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.id },
        data: { points: { decrement: reward.cost } },
      }),
      prisma.redemption.create({
        data: { rewardId: reward.id, userId: req.user.id, code },
      }),
    ]);

    res.status(201).json({
      points: updatedUser.points,
      redemption: { ...redemption, reward, code },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
