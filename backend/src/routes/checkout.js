import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema } from "../validators/checkout.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    const fail = req.query.fail === "1" || req.query.fail === "true";
    const { shippingName, shippingLine1, shippingCity, shippingPostal } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      throw new AppError("Cart is empty", 400, "empty_cart");
    }

    let totalCents = 0;
    for (const line of cartItems) {
      if (line.quantity > line.product.stock) {
        throw new AppError(`Insufficient stock for ${line.product.name}`, 400, "insufficient_stock");
      }
      totalCents += line.product.priceCents * line.quantity;
    }

    const paymentStatus = fail ? "failed" : "succeeded";

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          userId: req.userId,
          status: paymentStatus === "succeeded" ? "placed" : "payment_failed",
          paymentStatus,
          shippingName,
          shippingLine1,
          shippingCity,
          shippingPostal,
          totalCents,
          items: {
            create: cartItems.map((c) => ({
              productId: c.productId,
              quantity: c.quantity,
              priceCents: c.product.priceCents,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      if (paymentStatus === "succeeded") {
        for (const c of cartItems) {
          await tx.product.update({
            where: { id: c.productId },
            data: { stock: { decrement: c.quantity } },
          });
        }
        await tx.cartItem.deleteMany({ where: { userId: req.userId } });
      }

      return o;
    });

    res.status(201).json(order);
  })
);

export default router;
