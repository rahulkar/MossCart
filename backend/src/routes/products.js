import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { productsQuerySchema } from "../validators/products.js";
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
    const { q, category, ecoMin } = req.query;

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
    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json(products);
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

export default router;
