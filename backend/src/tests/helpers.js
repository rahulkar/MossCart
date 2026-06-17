import request from "supertest";
import { app } from "../server.js";
import { prisma } from "../db.js";
import { products } from "../seed-data.js";

export { app };

export function api() {
  return request(app);
}

export async function seedProducts() {
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  return prisma.product.findMany();
}

export async function createUser(overrides = {}) {
  const payload = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(payload);
  if (res.status !== 201) {
    throw new Error(
      `createUser failed with status ${res.status}: ${JSON.stringify(res.body)}`
    );
  }
  return {
    user: res.body.user,
    token: res.body.token,
    password: payload.password,
  };
}

export async function addToCart(token, productId, quantity = 1) {
  return request(app)
    .post("/api/cart/items")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId, quantity });
}
