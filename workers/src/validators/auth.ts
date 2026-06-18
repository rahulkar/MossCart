import { z } from "zod";

const email = z.string().trim().toLowerCase().min(1, "Email is required").email("Invalid email");
const password = z.string().min(6, "Password must be at least 6 characters");
const name = z.string().trim().min(1, "Name is required");

export const registerSchema = z.object({
  name,
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: password,
});
