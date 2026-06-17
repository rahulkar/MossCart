import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema } from "../validators/users.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.use(requireAuth);

const safeUserSelect = { id: true, email: true, name: true, createdAt: true };

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: safeUserSelect,
    });
    if (!user) throw new AppError("Not found", 404, "not_found");
    res.json(user);
  })
);

router.put(
  "/me",
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) {
      const taken = await prisma.user.findFirst({
        where: { email, NOT: { id: req.userId } },
      });
      if (taken) throw new AppError("Email in use", 409, "email_in_use");
      data.email = email;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: safeUserSelect,
    });
    res.json(user);
  })
);

export default router;
