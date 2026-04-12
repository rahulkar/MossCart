import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/me", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.put("/me", async (req, res) => {
  const { name, email } = req.body || {};
  const data = {};
  if (name !== undefined) data.name = String(name).trim();
  if (email !== undefined) {
    const e = String(email).trim().toLowerCase();
    const taken = await prisma.user.findFirst({
      where: { email: e, NOT: { id: req.userId } },
    });
    if (taken) return res.status(409).json({ error: "Email in use" });
    data.email = e;
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json(user);
});

export default router;
