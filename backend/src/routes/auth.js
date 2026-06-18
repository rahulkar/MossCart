import { Router } from "express";
import { prisma } from "../db.js";
import { hashPassword, comparePassword, signToken } from "../auth.js";
import { requireAuth } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators/auth.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

const safeUserSelect = { id: true, email: true, name: true, role: true, createdAt: true };

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
    const token = signToken({ id: user.id, role: user.role });
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
    const token = signToken({ id: user.id, role: user.role });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
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

router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw new AppError("User not found", 404, "not_found");
    if (!(await comparePassword(currentPassword, user.passwordHash))) {
      throw new AppError("Current password is incorrect", 401, "invalid_credentials");
    }
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: newHash },
    });
    res.json({ ok: true });
  })
);

export default router;
