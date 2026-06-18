import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const cartItemDeleteSchema = z.object({});
