const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const KNOWN_SUBJECTS = [
  'מתמטיקה 5 יח"ל',
  'מתמטיקה 3 יח"ל',
  "אנגלית",
  "פיזיקה",
  "מדעי המחשב",
  "כימיה",
  "ביולוגיה",
  "ערבית",
  "היסטוריה",
  "לשון",
  'תנ"ך',
  "אזרחות",
  "ספרות",
  "גיאוגרפיה",
];

function normalizeSubject(value) {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/[׳’]/g, "'")
    .replace(/[״”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function canonicalizeSubject(value) {
  const normalized = normalizeSubject(value);
  const canonical = KNOWN_SUBJECTS.find((item) => normalizeSubject(item) === normalized);
  return canonical || (value ?? "").replace(/\s+/g, " ").trim();
}

// GET /api/library/subjects — list all subjects with resource counts
router.get("/library/subjects", authenticate, async (req, res, next) => {
  try {
    const rows = await prisma.resource.findMany({
      select: { subject: true },
    });

    const byNormalized = new Map();
    for (const row of rows) {
      const normalized = normalizeSubject(row.subject);
      if (!normalized) continue;

      const canonical = canonicalizeSubject(row.subject);
      const prev = byNormalized.get(normalized);
      if (prev) {
        prev.count += 1;
      } else {
        byNormalized.set(normalized, { subject: canonical, count: 1 });
      }
    }

    const counts = Array.from(byNormalized.values()).sort((a, b) => b.count - a.count);
    res.json(counts);
  } catch (err) {
    next(err);
  }
});

// GET /api/library/resources — list recent resources, optionally filtered by subject
router.get("/library/resources", authenticate, async (req, res, next) => {
  try {
    const requestId = crypto.randomUUID();
    const me = await prisma.user.findUnique({ where: { id: req.user.id } });
    const selectedSubject = (req.query.subject ?? "").toString().trim();
    const selectedSubjectNorm = normalizeSubject(selectedSubject);
    const scope = (req.query.scope ?? "all").toString().trim().toLowerCase();
    const mySubjects = [...(me?.strongSubjects ?? []), ...(me?.weakSubjects ?? [])];

    const where = scope === "mine" && mySubjects.length > 0
      ? {
          OR: [
            { subject: { in: mySubjects } },
            { authorId: req.user.id },
          ],
        }
      : undefined;

    const rawResources = await prisma.resource.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarColor: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const resources = selectedSubjectNorm
      ? rawResources.filter((row) => normalizeSubject(row.subject) === selectedSubjectNorm)
      : rawResources;

    res.setHeader("x-request-id", requestId);
    res.setHeader("x-total-count", String(resources.length));
    res.json({
      ok: true,
      requestId,
      total: resources.length,
      resources,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/library/resources — add a new resource link
router.post("/library/resources", authenticate, async (req, res, next) => {
  const schema = z.object({
    title: z.string().min(1).max(200),
    url: z.string().url(),
    subject: z.string().min(1).max(100),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.errors });

  try {
    const resource = await prisma.resource.create({
      data: {
        ...parsed.data,
        subject: canonicalizeSubject(parsed.data.subject),
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, avatarColor: true } },
      },
    });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
