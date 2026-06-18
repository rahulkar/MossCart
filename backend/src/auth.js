import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

export function signToken({ id, role }) {
  return jwt.sign({ sub: id, role }, config.JWT_SECRET, { expiresIn: "7d" });
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

export function getTokenRole(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return decoded.role || null;
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
