import { describe, it, expect } from "vitest";
import { api, createUser, seedProducts, addToCart } from "./helpers.js";

describe("GET /api/cart", () => {
  it("returns empty cart for a new user", async () => {
    const { token } = await createUser();
    const res = await api().get("/api/cart").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body).toEqual([]);
  });

  it("returns 401 for unauthenticated requests", async () => {
    await api().get("/api/cart").expect(401);
  });
});

describe("POST /api/cart/items", () => {
  it("adds a new item to the cart", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();

    const res = await addToCart(token, product.id, 2);
    expect(res.body.quantity).toBe(2);
    expect(res.body.product.id).toBe(product.id);
  });

  it("merges duplicate items and clamps to stock", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();

    await addToCart(token, product.id, product.stock - 2);
    const res = await addToCart(token, product.id, 5);

    expect(res.body.quantity).toBe(product.stock);
  });

  it("clamps initial quantity to stock", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();

    const res = await addToCart(token, product.id, product.stock + 10);
    expect(res.body.quantity).toBe(product.stock);
  });

  it("returns 404 for unknown product", async () => {
    const { token } = await createUser();
    const res = await api()
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: "does-not-exist", quantity: 1 })
      .expect(404);
    expect(res.body.error.code).toBe("not_found");
  });
});

describe("PATCH /api/cart/items/:id", () => {
  it("updates quantity and clamps to stock", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();
    const created = await addToCart(token, product.id, 1);

    const res = await api()
      .patch(`/api/cart/items/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: product.stock + 5 })
      .expect(200);

    expect(res.body.quantity).toBe(product.stock);
  });

  it("returns 404 for items owned by another user", async () => {
    const { token: tokenA } = await createUser({ email: "a@example.com" });
    const { token: tokenB } = await createUser({ email: "b@example.com" });
    const [product] = await seedProducts();
    const created = await addToCart(tokenA, product.id, 1);

    await api()
      .patch(`/api/cart/items/${created.body.id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ quantity: 2 })
      .expect(404);
  });
});

describe("DELETE /api/cart/items/:id", () => {
  it("removes an item", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();
    const created = await addToCart(token, product.id, 1);

    await api()
      .delete(`/api/cart/items/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const cart = await api().get("/api/cart").set("Authorization", `Bearer ${token}`).expect(200);
    expect(cart.body).toHaveLength(0);
  });
});
