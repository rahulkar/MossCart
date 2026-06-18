import { describe, it, expect } from "vitest";
import { api, seedProducts, createUser, createAdminUser } from "./helpers.js";

const validProduct = {
  name: "New Moss",
  subtitle: "Fresh",
  sku: "NM-001",
  description: "A new moss.",
  priceCents: 999,
  imageUrl: "https://example.com/moss.jpg",
  category: "Moss",
  ecoScore: 4,
  stock: 10,
};

describe("GET /api/products/categories", () => {
  it("returns distinct categories", async () => {
    await seedProducts();
    const res = await api().get("/api/products/categories").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/products", () => {
  it("returns paginated products by default", async () => {
    await seedProducts();
    const res = await api().get("/api/products").expect(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    await seedProducts();
    const res = await api().get("/api/products?category=Moss").expect(200);
    expect(res.body.products.every((p) => p.category === "Moss")).toBe(true);
  });

  it("filters by ecoMin", async () => {
    await seedProducts();
    const res = await api().get("/api/products?ecoMin=5").expect(200);
    expect(res.body.products.every((p) => p.ecoScore >= 5)).toBe(true);
  });

  it("searches by name", async () => {
    await seedProducts();
    const res = await api().get("/api/products?q=java").expect(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it("paginates results", async () => {
    await seedProducts();
    const res = await api().get("/api/products?page=1&pageSize=2").expect(200);
    expect(res.body.products.length).toBe(2);
    expect(res.body.pageSize).toBe(2);
  });

  it("rejects invalid ecoMin with 400", async () => {
    const res = await api().get("/api/products?ecoMin=99").expect(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});

describe("GET /api/products/:id", () => {
  it("returns a product by id", async () => {
    const products = await seedProducts();
    const res = await api().get(`/api/products/${products[0].id}`).expect(200);
    expect(res.body.id).toBe(products[0].id);
  });

  it("returns 404 for unknown id", async () => {
    const res = await api().get("/api/products/does-not-exist").expect(404);
    expect(res.body.error.code).toBe("not_found");
  });
});

describe("POST /api/products", () => {
  it("creates a product when admin", async () => {
    const { token } = await createAdminUser();
    const res = await api()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(validProduct)
      .expect(201);
    expect(res.body.name).toBe(validProduct.name);
    expect(res.body.category).toBe(validProduct.category);
  });

  it("rejects non-admin users", async () => {
    const { token } = await createUser();
    await api()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(validProduct)
      .expect(403);
  });

  it("requires authentication", async () => {
    await api().post("/api/products").send(validProduct).expect(401);
  });

  it("validates required fields", async () => {
    const { token } = await createAdminUser();
    const res = await api()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});

describe("PUT /api/products/:id", () => {
  it("updates a product when admin", async () => {
    const { token } = await createAdminUser();
    const products = await seedProducts();
    const res = await api()
      .put(`/api/products/${products[0].id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priceCents: 1 })
      .expect(200);
    expect(res.body.priceCents).toBe(1);
  });

  it("rejects non-admin users", async () => {
    const { token } = await createUser();
    const products = await seedProducts();
    await api()
      .put(`/api/products/${products[0].id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priceCents: 1 })
      .expect(403);
  });

  it("returns 404 for unknown id", async () => {
    const { token } = await createAdminUser();
    const res = await api()
      .put("/api/products/does-not-exist")
      .set("Authorization", `Bearer ${token}`)
      .send({ priceCents: 1 })
      .expect(404);
    expect(res.body.error.code).toBe("not_found");
  });
});

describe("DELETE /api/products/:id", () => {
  it("deletes a product when admin", async () => {
    const { token } = await createAdminUser();
    const products = await seedProducts();
    await api()
      .delete(`/api/products/${products[0].id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    await api().get(`/api/products/${products[0].id}`).expect(404);
  });

  it("rejects non-admin users", async () => {
    const { token } = await createUser();
    const products = await seedProducts();
    await api()
      .delete(`/api/products/${products[0].id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });
});
