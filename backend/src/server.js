import "dotenv/config";
import express from "express";
import cors from "cors";
import { execSync } from "node:child_process";
import { prisma } from "./db.js";
import { authOptional } from "./middleware.js";
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";
import usersRoutes from "./routes/users.js";
import ordersRoutes from "./routes/orders.js";
import { seedCatalog } from "./seed.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(authOptional);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ ok: false, error: String(e?.message || e) });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);

function migrate() {
  try {
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (e) {
    console.error("migrate failed", e);
    process.exit(1);
  }
}

async function seedCatalogIfNeeded() {
  if (process.env.RESEED_CATALOG === "true") {
    await seedCatalog();
    return;
  }
  const count = await prisma.product.count();
  if (count === 0) {
    await seedCatalog();
  }
}

migrate();
await seedCatalogIfNeeded();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on ${PORT}`);
});
