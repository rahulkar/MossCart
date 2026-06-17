import { describe, it, expect } from "vitest";
import { api, createUser, seedProducts, addToCart } from "./helpers.js";

const shipping = {
  shippingName: "Alice",
  shippingLine1: "123 Tank St",
  shippingCity: "Aquapolis",
  shippingPostal: "12345",
};

describe("GET /api/orders", () => {
  it("returns the user order history", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();
    await addToCart(token, product.id, 1);
    await api().post("/api/checkout").set("Authorization", `Bearer ${token}`).send(shipping).expect(201);

    const res = await api().get("/api/orders").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].items).toHaveLength(1);
  });
});

describe("GET /api/orders/:id", () => {
  it("returns the order scoped to the user", async () => {
    const { token, user } = await createUser();
    const [product] = await seedProducts();
    await addToCart(token, product.id, 1);
    const checkout = await api()
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send(shipping)
      .expect(201);

    const res = await api()
      .get(`/api/orders/${checkout.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body.userId).toBe(user.id);
  });

  it("returns 404 for orders owned by another user", async () => {
    const { token: tokenA } = await createUser({ email: "a@example.com" });
    const { token: tokenB } = await createUser({ email: "b@example.com" });
    const [product] = await seedProducts();
    await addToCart(tokenA, product.id, 1);
    const checkout = await api()
      .post("/api/checkout")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(shipping)
      .expect(201);

    await api()
      .get(`/api/orders/${checkout.body.id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
  });
});
