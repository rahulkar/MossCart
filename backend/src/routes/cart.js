import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { cartItemSchema, cartItemUpdateSchema, cartItemDeleteSchema } from "../validators/cart.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true },
    });
    res.json(items);
  })
);

router.post(
  "/items",
  validate(cartItemSchema),
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404, "not_found");

    const qty = Math.min(quantity, product.stock);

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.userId, productId: product.id } },
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
      data: { userId: req.userId, productId: product.id, quantity: qty },
      include: { product: true },
    });
    res.status(201).json(created);
  })
);

router.patch(
  "/items/:id",
  validate(cartItemUpdateSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await prisma.cartItem.findFirst({
      where: { id, userId: req.userId },
      include: { product: true },
    });
    if (!item) throw new AppError("Not found", 404, "not_found");

    const qty = Math.min(quantity, item.product.stock);
    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: qty },
      include: { product: true },
    });
    res.json(updated);
  })
);

router.delete(
  "/items/:id",
  validate(cartItemDeleteSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await prisma.cartItem.findFirst({
      where: { id, userId: req.userId },
    });
    if (!item) throw new AppError("Not found", 404, "not_found");
    await prisma.cartItem.delete({ where: { id: item.id } });
    res.status(204).end();
  })
);

export default router;
