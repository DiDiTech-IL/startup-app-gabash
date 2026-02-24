const express = require("express");
const { z } = require("zod");
const { prisma } = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/posts
router.get("/posts", authenticate, async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, avatarColor: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = posts.map((post) => ({
      id: post.id,
      text: post.text,
      author: post.author,
      likeCount: post.likes.length,
      commentCount: post._count.comments,
      createdAt: post.createdAt,
      isLikedByMe: post.likes.some((l) => l.userId === req.user.id),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts
router.post("/posts", authenticate, async (req, res, next) => {
  const schema = z.object({ text: z.string().min(1).max(1000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const post = await prisma.post.create({
      data: { text: parsed.data.text, authorId: req.user.id },
      include: {
        author: { select: { id: true, name: true, avatarColor: true } },
      },
    });
    res.status(201).json({
      id: post.id,
      text: post.text,
      author: post.author,
      likeCount: 0,
      commentCount: 0,
      createdAt: post.createdAt,
      isLikedByMe: false,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/like
router.post("/posts/:id/like", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: req.user.id } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      res.json({ liked: false });
    } else {
      await prisma.postLike.create({ data: { postId: id, userId: req.user.id } });
      res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/comments
router.post("/posts/:id/comments", authenticate, async (req, res, next) => {
  const schema = z.object({ text: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const comment = await prisma.comment.create({
      data: { postId: req.params.id, authorId: req.user.id, text: parsed.data.text },
      include: { author: { select: { id: true, name: true, avatarColor: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
