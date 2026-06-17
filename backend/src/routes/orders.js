import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    });
    res.json(orders);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new AppError("Not found", 404, "not_found");
    res.json(order);
  })
);

export default router;
