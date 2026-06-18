import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { createPrisma, type Env } from "./db.js";
import {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  type TokenPayload,
} from "./auth.js";
import * as productValidators from "./validators/products.js";
import * as authValidators from "./validators/auth.js";
import * as cartValidators from "./validators/cart.js";
import * as checkoutValidators from "./validators/checkout.js";
import * as userValidators from "./validators/users.js";

const PAGE_SIZE = 12;
const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

const app = new Hono<{ Bindings: Env; Variables: { user: TokenPayload } }>();

app.use(
  cors({
    origin: (origin) => origin,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: { user: TokenPayload } }> = async (c, next) => {
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? await verifyToken(token, c.env.JWT_SECRET) : null;
  if (!payload) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  c.set("user", payload);
  await next();
};

const adminMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: { user: TokenPayload } }> = async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  await next();
};

function appError(status: number, message: string, code?: string) {
  return new HTTPException(status, { res: new Response(JSON.stringify({ error: { message, code } }), { status }) });
}

app.get("/api/health", async (c) => {
  const prisma = createPrisma(c.env);
  await prisma.$queryRaw`SELECT 1`;
  return c.json({ ok: true });
});

// Auth
app.post("/api/auth/register", zValidator("json", authValidators.registerSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const body = c.req.valid("json");
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw appError(409, "Email already registered", "email_in_use");

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: { email: body.email, name: body.name, passwordHash, role: "user" },
    select: safeUserSelect,
  });
  const token = await signToken({ sub: user.id, role: user.role }, c.env.JWT_SECRET);
  return c.json({ user, token }, 201);
});

app.post("/api/auth/login", zValidator("json", authValidators.loginSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const body = c.req.valid("json");
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await comparePassword(body.password, user.passwordHash))) {
    throw appError(401, "Invalid credentials", "invalid_credentials");
  }
  const token = await signToken({ sub: user.id, role: user.role }, c.env.JWT_SECRET);
  return c.json({ user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }, token });
});

app.get("/api/auth/me", authMiddleware, async (c) => {
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({
    where: { id: c.get("user").sub },
    select: safeUserSelect,
  });
  if (!user) throw appError(404, "User not found", "not_found");
  return c.json(user);
});

app.post("/api/auth/change-password", authMiddleware, zValidator("json", authValidators.changePasswordSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const body = c.req.valid("json");
  const user = await prisma.user.findUnique({
    where: { id: c.get("user").sub },
    select: { id: true, passwordHash: true },
  });
  if (!user) throw appError(404, "User not found", "not_found");
  if (!(await comparePassword(body.currentPassword, user.passwordHash))) {
    throw appError(401, "Current password is incorrect", "invalid_credentials");
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(body.newPassword) },
  });
  return c.json({ ok: true });
});

// Products
app.get("/api/products/categories", async (c) => {
  const prisma = createPrisma(c.env);
  const rows = await prisma.product.groupBy({ by: ["category"], orderBy: { category: "asc" } });
  return c.json(rows.map((r) => r.category));
});

app.get("/api/products", zValidator("query", productValidators.productsQuerySchema), async (c) => {
  const prisma = createPrisma(c.env);
  const { q, category, ecoMin, page, pageSize } = c.req.valid("query");

  const and: any[] = [];
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
  if (category) and.push({ category });
  if (ecoMin != null) and.push({ ecoScore: { gte: ecoMin } });

  const where = and.length ? { AND: and } : undefined;
  const skip = (page - 1) * pageSize;

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { name: "asc" }, skip, take: pageSize }),
    prisma.product.count({ where }),
  ]);

  return c.json({ products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

app.get("/api/products/:id", async (c) => {
  const prisma = createPrisma(c.env);
  const product = await prisma.product.findUnique({ where: { id: c.req.param("id") } });
  if (!product) throw appError(404, "Not found", "not_found");
  return c.json(product);
});

app.post("/api/products", authMiddleware, adminMiddleware, zValidator("json", productValidators.createProductSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const body = c.req.valid("json");
  const product = await prisma.product.create({ data: body });
  return c.json(product, 201);
});

app.put("/api/products/:id", authMiddleware, adminMiddleware, zValidator("json", productValidators.updateProductSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const existing = await prisma.product.findUnique({ where: { id: c.req.param("id") } });
  if (!existing) throw appError(404, "Not found", "not_found");
  const product = await prisma.product.update({ where: { id: c.req.param("id") }, data: c.req.valid("json") });
  return c.json(product);
});

app.delete("/api/products/:id", authMiddleware, adminMiddleware, async (c) => {
  const prisma = createPrisma(c.env);
  const existing = await prisma.product.findUnique({ where: { id: c.req.param("id") } });
  if (!existing) throw appError(404, "Not found", "not_found");
  await prisma.product.delete({ where: { id: c.req.param("id") } });
  return c.body(null, 204);
});

// Users
app.get("/api/users/me", authMiddleware, async (c) => {
  const prisma = createPrisma(c.env);
  const user = await prisma.user.findUnique({ where: { id: c.get("user").sub }, select: safeUserSelect });
  if (!user) throw appError(404, "User not found", "not_found");
  return c.json(user);
});

app.put("/api/users/me", authMiddleware, zValidator("json", userValidators.updateProfileSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const body = c.req.valid("json");
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) {
    const taken = await prisma.user.findFirst({ where: { email: body.email, NOT: { id: c.get("user").sub } } });
    if (taken) throw appError(409, "Email in use", "email_in_use");
    data.email = body.email;
  }
  const user = await prisma.user.update({ where: { id: c.get("user").sub }, data, select: safeUserSelect });
  return c.json(user);
});

// Cart
app.use("/api/cart/*", authMiddleware);

app.get("/api/cart", async (c) => {
  const prisma = createPrisma(c.env);
  const items = await prisma.cartItem.findMany({
    where: { userId: c.get("user").sub },
    include: { product: true },
  });
  return c.json(items);
});

app.post("/api/cart/items", zValidator("json", cartValidators.cartItemSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const { productId, quantity } = c.req.valid("json");
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw appError(404, "Product not found", "not_found");

  const qty = Math.min(quantity, product.stock);
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: c.get("user").sub, productId } },
  });

  if (existing) {
    const nextQty = Math.min(existing.quantity + qty, product.stock);
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
      include: { product: true },
    });
    return c.json(updated);
  }

  const created = await prisma.cartItem.create({
    data: { userId: c.get("user").sub, productId, quantity: qty },
    include: { product: true },
  });
  return c.json(created, 201);
});

app.patch("/api/cart/items/:id", zValidator("json", cartValidators.cartItemUpdateSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const { quantity } = c.req.valid("json");
  const item = await prisma.cartItem.findFirst({
    where: { id: c.req.param("id"), userId: c.get("user").sub },
    include: { product: true },
  });
  if (!item) throw appError(404, "Not found", "not_found");

  const qty = Math.min(quantity, item.product.stock);
  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: qty },
    include: { product: true },
  });
  return c.json(updated);
});

app.delete("/api/cart/items/:id", async (c) => {
  const prisma = createPrisma(c.env);
  const item = await prisma.cartItem.findFirst({
    where: { id: c.req.param("id"), userId: c.get("user").sub },
  });
  if (!item) throw appError(404, "Not found", "not_found");
  await prisma.cartItem.delete({ where: { id: item.id } });
  return c.body(null, 204);
});

// Checkout
app.use("/api/checkout/*", authMiddleware);

app.post("/api/checkout", zValidator("json", checkoutValidators.checkoutSchema), async (c) => {
  const prisma = createPrisma(c.env);
  const fail = c.req.query("fail") === "1" || c.req.query("fail") === "true";
  const { shippingName, shippingLine1, shippingCity, shippingPostal } = c.req.valid("json");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: c.get("user").sub },
    include: { product: true },
  });
  if (cartItems.length === 0) throw appError(400, "Cart is empty", "empty_cart");

  let totalCents = 0;
  for (const line of cartItems) {
    if (line.quantity > line.product.stock) {
      throw appError(400, `Insufficient stock for ${line.product.name}`, "insufficient_stock");
    }
    totalCents += line.product.priceCents * line.quantity;
  }

  const paymentStatus = fail ? "failed" : "succeeded";
  const orderId = crypto.randomUUID();

  const queries: any[] = [
    prisma.order.create({
      data: {
        id: orderId,
        userId: c.get("user").sub,
        status: paymentStatus === "succeeded" ? "placed" : "payment_failed",
        paymentStatus,
        shippingName,
        shippingLine1,
        shippingCity,
        shippingPostal,
        totalCents,
      },
    }),
    prisma.orderItem.createMany({
      data: cartItems.map((c) => ({
        orderId,
        productId: c.productId,
        quantity: c.quantity,
        priceCents: c.product.priceCents,
      })),
    }),
  ];

  if (paymentStatus === "succeeded") {
    for (const c of cartItems) {
      queries.push(
        prisma.product.update({
          where: { id: c.productId },
          data: { stock: { decrement: c.quantity } },
        })
      );
    }
    queries.push(prisma.cartItem.deleteMany({ where: { userId: c.get("user").sub } }));
  }

  await prisma.$transaction(queries);

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: c.get("user").sub },
    include: { items: { include: { product: true } } },
  });

  return c.json(order, 201);
});

// Orders
app.use("/api/orders/*", authMiddleware);

app.get("/api/orders", async (c) => {
  const prisma = createPrisma(c.env);
  const orders = await prisma.order.findMany({
    where: { userId: c.get("user").sub },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  return c.json(orders);
});

app.get("/api/orders/:id", async (c) => {
  const prisma = createPrisma(c.env);
  const order = await prisma.order.findFirst({
    where: { id: c.req.param("id"), userId: c.get("user").sub },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw appError(404, "Not found", "not_found");
  return c.json(order);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    if (err.res) return err.res;
    return c.json({ error: { message: err.message, code: "http_exception" } }, err.status);
  }
  console.error(err);
  return c.json({ error: { message: "Internal server error", code: "internal_error" } }, 500);
});

export default app;
