import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const fail = req.query.fail === "1" || req.query.fail === "true";
    const { shippingName, shippingLine1, shippingCity, shippingPostal } = req.body || {};
    if (!shippingName || !shippingLine1 || !shippingCity || !shippingPostal) {
      return res.status(400).json({
        error: "shippingName, shippingLine1, shippingCity, shippingPostal required",
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let totalCents = 0;
    for (const line of cartItems) {
      if (line.quantity > line.product.stock) {
        return res.status(400).json({
          error: `Insufficient stock for ${line.product.name}`,
        });
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
          shippingName: String(shippingName).trim(),
          shippingLine1: String(shippingLine1).trim(),
          shippingCity: String(shippingCity).trim(),
          shippingPostal: String(shippingPostal).trim(),
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
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Checkout failed" });
  }
});

export default router;
