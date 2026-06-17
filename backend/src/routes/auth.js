import { Router } from "express";
import { prisma } from "../db.js";
import { hashPassword, comparePassword, signToken } from "../auth.js";
import { requireAuth } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

const safeUserSelect = { id: true, email: true, name: true, createdAt: true };

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("Email already registered", 409, "email_in_use");
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: safeUserSelect,
    });
    const token = signToken(user.id);
    res.status(201).json({ user, token });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new AppError("Invalid credentials", 401, "invalid_credentials");
    }
    const token = signToken(user.id);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: safeUserSelect,
    });
    if (!user) throw new AppError("User not found", 404, "not_found");
    res.json(user);
  })
);

export default router;
