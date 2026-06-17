import { describe, it, expect } from "vitest";
import { api, seedProducts } from "./helpers.js";

describe("GET /api/products/categories", () => {
  it("returns distinct categories", async () => {
    await seedProducts();
    const res = await api().get("/api/products/categories").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/products", () => {
  it("returns all products by default", async () => {
    await seedProducts();
    const res = await api().get("/api/products").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    await seedProducts();
    const res = await api().get("/api/products?category=Moss").expect(200);
    expect(res.body.every((p) => p.category === "Moss")).toBe(true);
  });

  it("filters by ecoMin", async () => {
    await seedProducts();
    const res = await api().get("/api/products?ecoMin=5").expect(200);
    expect(res.body.every((p) => p.ecoScore >= 5)).toBe(true);
  });

  it("searches by name", async () => {
    await seedProducts();
    const res = await api().get("/api/products?q=java").expect(200);
    expect(res.body.length).toBeGreaterThan(0);
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
