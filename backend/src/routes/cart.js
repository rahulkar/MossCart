import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.userId },
    include: { product: true },
  });
  res.json(items);
});

router.post("/items", async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!productId) return res.status(400).json({ error: "productId required" });
  const product = await prisma.product.findUnique({ where: { id: String(productId) } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId: req.userId, productId: product.id },
    },
  });
  if (existing) {
    const nextQty = Math.min(existing.quantity + qty, product.stock);
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
      include: { product: true },
    });
    return res.json(updated);
  }
  const created = await prisma.cartItem.create({
    data: {
      userId: req.userId,
      productId: product.id,
      quantity: qty,
    },
    include: { product: true },
  });
  res.status(201).json(created);
});

router.patch("/items/:id", async (req, res) => {
  const { quantity } = req.body || {};
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { product: true },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  const qty = Math.max(1, Math.min(Number(quantity) || 1, item.product.stock));
  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: qty },
    include: { product: true },
  });
  res.json(updated);
});

router.delete("/items/:id", async (req, res) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  await prisma.cartItem.delete({ where: { id: item.id } });
  res.status(204).end();
});

export default router;
