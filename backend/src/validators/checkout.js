import { z } from "zod";

const trimmedString = z.string().trim().min(1, "This field is required");

export const checkoutSchema = z.object({
  body: z.object({
    shippingName: trimmedString,
    shippingLine1: trimmedString,
    shippingCity: trimmedString,
    shippingPostal: trimmedString,
  }),
});
