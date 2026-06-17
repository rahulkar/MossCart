import { describe, it, expect } from "vitest";
import { api, createUser, seedProducts, addToCart } from "./helpers.js";

const shipping = {
  shippingName: "Alice",
  shippingLine1: "123 Tank St",
  shippingCity: "Aquapolis",
  shippingPostal: "12345",
};

describe("POST /api/checkout", () => {
  it("creates an order, decrements stock, and clears cart", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();
    const qty = 2;
    await addToCart(token, product.id, qty);

    const res = await api()
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send(shipping)
      .expect(201);

    expect(res.body.status).toBe("placed");
    expect(res.body.paymentStatus).toBe("succeeded");
    expect(res.body.totalCents).toBe(product.priceCents * qty);
    expect(res.body.items).toHaveLength(1);

    const cart = await api().get("/api/cart").set("Authorization", `Bearer ${token}`).expect(200);
    expect(cart.body).toHaveLength(0);
  });

  it("simulates payment failure and preserves cart", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();
    await addToCart(token, product.id, 1);

    const res = await api()
      .post("/api/checkout?fail=true")
      .set("Authorization", `Bearer ${token}`)
      .send(shipping)
      .expect(201);

    expect(res.body.status).toBe("payment_failed");
    expect(res.body.paymentStatus).toBe("failed");

    const cart = await api().get("/api/cart").set("Authorization", `Bearer ${token}`).expect(200);
    expect(cart.body).toHaveLength(1);
  });

  it("rejects checkout with an empty cart", async () => {
    const { token } = await createUser();
    const res = await api()
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send(shipping)
      .expect(400);
    expect(res.body.error.code).toBe("empty_cart");
  });

  it("rejects checkout when stock is insufficient", async () => {
    const { token } = await createUser();
    const [product] = await seedProducts();
    await addToCart(token, product.id, product.stock);

    // Reduce stock by checking out once with a different user.
    const { token: token2 } = await createUser({ email: "other@example.com" });
    await addToCart(token2, product.id, product.stock);
    await api().post("/api/checkout").set("Authorization", `Bearer ${token2}`).send(shipping).expect(201);

    const res = await api()
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send(shipping)
      .expect(400);
    expect(res.body.error.code).toBe("insufficient_stock");
  });
});
