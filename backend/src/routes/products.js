import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  productsQuerySchema,
  createProductSchema,
  updateProductSchema,
} from "../validators/products.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.product.groupBy({
      by: ["category"],
      orderBy: { category: "asc" },
    });
    res.json(rows.map((r) => r.category));
  })
);

router.get(
  "/",
  validate(productsQuerySchema),
  asyncHandler(async (req, res) => {
    const { q, category, ecoMin, page, pageSize } = req.query;

    const and = [];
    if (q) {
      and.push({
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { subtitle: { contains: q } },
          { sku: { contains: q } },
        ],
      });
    }
    if (category) {
      and.push({ category });
    }
    if (ecoMin != null) {
      and.push({ ecoScore: { gte: ecoMin } });
    }

    const where = and.length ? { AND: and } : undefined;
    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) throw new AppError("Not found", 404, "not_found");
    res.json(product);
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  })
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Not found", 404, "not_found");
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Not found", 404, "not_found");
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
