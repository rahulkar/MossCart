import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

export function signToken(userId) {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded.sub;
  } catch {
    return null;
  }
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
