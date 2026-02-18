const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

const INTEREST_LABELS = {
  gaming: "גיימינג",
  sport: "ספורט",
  music: "מוזיקה",
  travel: "טיולים",
};

// GET /api/matches
router.get("/matches", authenticate, async (req, res, next) => {
  try {
    const me = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!me) return res.status(404).json({ error: "User not found" });

    const others = await prisma.user.findMany({
      where: { id: { not: me.id } },
      select: {
        id: true,
        name: true,
        school: true,
        grade: true,
        avatarColor: true,
        strongSubjects: true,
        weakSubjects: true,
        interests: true,
        points: true,
        volunteerHours: true,
      },
    });

    const matches = others.map((user) => {
      // Score based on subject overlap
      const iCanHelpThem = me.strongSubjects.filter((s) => user.weakSubjects.includes(s));
      const theyCanHelpMe = user.strongSubjects.filter((s) => me.weakSubjects.includes(s));
      const sharedInterests = me.interests.filter((i) => user.interests.includes(i));

      let score = 40;
      score += iCanHelpThem.length * 15;
      score += theyCanHelpMe.length * 15;
      score += sharedInterests.length * 10;
      const matchPercent = Math.min(99, score);

      // Build dynamic description
      let parts = [];
      if (theyCanHelpMe.length > 0) parts.push(`תותח/ית ב${theyCanHelpMe[0]}`);
      else if (iCanHelpThem.length > 0) parts.push(`צריך/ה עזרה ב${iCanHelpThem[0]}`);
      else parts.push("מתאים/ה ללמידה משותפת");

      if (sharedInterests.length > 0) {
        parts.push(`גם אוהב/ת ${INTEREST_LABELS[sharedInterests[0]] || sharedInterests[0]}`);
      }

      return {
        user,
        matchPercent,
        dynamicAbout: parts.join(", "),
      };
    });

    matches.sort((a, b) => b.matchPercent - a.matchPercent);

    res.json(matches);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
