import { z } from "zod";

const email = z.string().trim().toLowerCase().min(1, "Email is required").email("Invalid email");
const password = z.string().min(6, "Password must be at least 6 characters");
const name = z.string().trim().min(1, "Name is required");

export const registerSchema = z.object({
  body: z.object({
    email,
    password,
    name,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password,
  }),
});
