import { z } from "zod";

export const checkoutSchema = z.object({
  shippingName: z.string().trim().min(1),
  shippingLine1: z.string().trim().min(1),
  shippingCity: z.string().trim().min(1),
  shippingPostal: z.string().trim().min(1),
});
