import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { authOptional } from "./middleware.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";
import usersRoutes from "./routes/users.js";
import ordersRoutes from "./routes/orders.js";
import { seedCatalog } from "./seed.js";

export const app = express();

const corsOrigin = config.CORS_ORIGIN || true;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(authOptional);

const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX ?? "200", 10);
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? String(15 * 60 * 1000), 10);
const generalLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: Number.isFinite(rateLimitMax) ? rateLimitMax : 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

if (config.NODE_ENV !== "test") {
  const authRateLimitMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? "20", 10);
  const authLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    max: Number.isFinite(authRateLimitMax) ? authRateLimitMax : 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  });
  app.use("/api/auth", authLimiter);
}

app.get("/api/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);

app.use(errorHandler);

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

function startServer() {
  migrate();
  seedCatalogIfNeeded().then(() => {
    app.listen(config.PORT, "0.0.0.0", () => {
      console.log(`API listening on ${config.PORT}`);
    });
  });
}

const isMainModule = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMainModule) {
  startServer();
}
