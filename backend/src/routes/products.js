import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/categories", async (_req, res) => {
  const rows = await prisma.product.groupBy({
    by: ["category"],
    orderBy: { category: "asc" },
  });
  res.json(rows.map((r) => r.category));
});

router.get("/", async (req, res) => {
  const q = req.query.q ? String(req.query.q).trim() : "";
  const category = req.query.category ? String(req.query.category).trim() : "";
  const ecoRaw = req.query.ecoMin != null ? String(req.query.ecoMin).trim() : "";
  const ecoMin = ecoRaw === "" ? null : parseInt(ecoRaw, 10);

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
  if (ecoMin != null && !Number.isNaN(ecoMin)) {
    and.push({ ecoScore: { gte: ecoMin } });
  }

  const where = and.length ? { AND: and } : undefined;
  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
  });
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

export default router;
