import { describe, it, expect } from "vitest";
import { api, createUser, seedProducts } from "./helpers.js";

describe("POST /api/auth/register", () => {
  it("creates a new user and returns a token", async () => {
    const res = await api()
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "password123" })
      .expect(201);

    expect(res.body.user).toMatchObject({ name: "Alice", email: "alice@example.com" });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.token).toBeTruthy();
  });

  it("rejects duplicate email with 409", async () => {
    await createUser({ email: "dup@example.com" });

    const res = await api()
      .post("/api/auth/register")
      .send({ name: "Bob", email: "dup@example.com", password: "password123" })
      .expect(409);

    expect(res.body.error.code).toBe("email_in_use");
  });

  it("rejects invalid payloads with 400", async () => {
    const res = await api().post("/api/auth/register").send({ email: "bad" }).expect(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token for valid credentials", async () => {
    const { user, password } = await createUser({ email: "login@example.com" });
    const res = await api()
      .post("/api/auth/login")
      .send({ email: user.email, password })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(user.email);
  });

  it("rejects invalid credentials with 401", async () => {
    const { user } = await createUser({ email: "badlogin@example.com" });
    const res = await api()
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrong-password" })
      .expect(401);

    expect(res.body.error.code).toBe("invalid_credentials");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user with a valid token", async () => {
    const { user, token } = await createUser({ email: "me@example.com" });
    const res = await api().get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body.id).toBe(user.id);
  });

  it("returns 401 without a token", async () => {
    await api().get("/api/auth/me").expect(401);
  });

  it("returns 401 with an invalid token", async () => {
    await api().get("/api/auth/me").set("Authorization", "Bearer invalid").expect(401);
  });
});
