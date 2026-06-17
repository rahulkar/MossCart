import { verifyToken } from "./auth.js";
import { AppError } from "./errors/AppError.js";

export function authOptional(req, _res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  req.userId = verifyToken(token);
  next();
}

export function requireAuth(req, _res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  const userId = verifyToken(token);
  if (!userId) {
    return next(new AppError("Unauthorized", 401, "unauthorized"));
  }
  req.userId = userId;
  next();
}
