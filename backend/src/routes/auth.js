import { Router } from "express";
import { prisma } from "../db.js";
import { hashPassword, comparePassword, signToken } from "../auth.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password, and name required" });
    }
    const existing = await prisma.user.findUnique({ where: { email: String(email) } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await hashPassword(String(password));
    const user = await prisma.user.create({
      data: {
        email: String(email).trim().toLowerCase(),
        passwordHash,
        name: String(name).trim(),
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    const token = signToken(user.id);
    res.status(201).json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (!user || !(await comparePassword(String(password), user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user.id);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;
