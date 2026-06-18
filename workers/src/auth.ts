import { SignJWT, jwtVerify } from "jose";

const TEXT_ENCODER = new TextEncoder();

export interface TokenPayload {
  sub: string;
  role: string;
}

function getKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload, secret: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey(secret));
}

export async function verifyToken(token: string, secret: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(secret));
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(plain),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    key,
    256
  );
  const hash = new Uint8Array(bits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);
  return btoa(String.fromCharCode(...combined));
}

export async function comparePassword(plain: string, stored: string): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const hash = combined.slice(16);
    const key = await crypto.subtle.importKey(
      "raw",
      TEXT_ENCODER.encode(plain),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      key,
      256
    );
    const derived = new Uint8Array(bits);
    if (derived.length !== hash.length) return false;
    return derived.every((b, i) => b === hash[i]);
  } catch {
    return false;
  }
}
