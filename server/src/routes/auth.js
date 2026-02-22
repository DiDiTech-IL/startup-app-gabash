const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const BCRYPT_ROUNDS = 10;

const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  school: z.string().min(2).max(120),
  grade: z.string().min(1).max(40),
  pin: z.string().regex(/^\d{4}$/, "הקוד חייב להיות 4 ספרות"),
});

const signInSchema = z.object({
  name: z.string().min(1),
  school: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/),
});

// POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  try {
    const pinHash = await bcrypt.hash(parsed.data.pin, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        school: parsed.data.school.trim(),
        grade: parsed.data.grade.trim(),
        pinHash,
        avatarColor: "bg-blue-100",
        points: 0,
        volunteerHours: 0,
        strongSubjects: [],
        weakSubjects: [],
        interests: [],
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

    // Never return the hash to the client
    const { pinHash: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/signin
router.post("/signin", async (req, res, next) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  try {
    const { name, school, pin } = parsed.data;

    // Find all users matching name + school (case-insensitive trim)
    const candidates = await prisma.user.findMany({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        school: { equals: school.trim(), mode: "insensitive" },
      },
    });

    if (candidates.length === 0) {
      return res.status(401).json({ error: "לא נמצא משתמש עם השם ובית הספר האלה" });
    }

    // Verify PIN against each candidate (handles the rare name+school collision)
    let matched = null;
    for (const candidate of candidates) {
      if (candidate.pinHash && (await bcrypt.compare(pin, candidate.pinHash))) {
        matched = candidate;
        break;
      }
    }

    if (!matched) {
      return res.status(401).json({ error: "קוד PIN שגוי" });
    }

    const token = jwt.sign({ userId: matched.id }, JWT_SECRET, { expiresIn: "30d" });

    const { pinHash: _, ...safeUser } = matched;
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
