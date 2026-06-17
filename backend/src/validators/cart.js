import { z } from "zod";

export const cartItemSchema = z.object({
  body: z.object({
    productId: z.string().trim().min(1, "productId is required"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  }),
});

export const cartItemUpdateSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "Item id is required"),
  }),
  body: z.object({
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const cartItemDeleteSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "Item id is required"),
  }),
});
