const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/anonymous
router.post("/anonymous", async (req, res, next) => {
  try {
    // Pick the demo user "דניאל כהן" as the default
    let user = await prisma.user.findFirst({
      where: { name: "דניאל כהן" },
    });

    if (!user) {
      // Fallback: create a minimal user
      user = await prisma.user.create({
        data: {
          name: "דניאל כהן",
          school: "תיכון הראשונים",
          grade: 'י"א',
          avatarColor: "bg-blue-100",
          points: 60,
          volunteerHours: 12,
          strongSubjects: ["אנגלית", "מדעי המחשב"],
          weakSubjects: ["היסטוריה"],
          interests: ["gaming", "sport"],
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
