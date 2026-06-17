import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, "Name cannot be empty").optional(),
      email: z.string().trim().toLowerCase().email("Invalid email").optional(),
    })
    .refine((data) => data.name !== undefined || data.email !== undefined, {
      message: "No fields to update",
    }),
});
