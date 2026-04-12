import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  res.json(orders);
});

router.get("/:id", async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

export default router;
