import { z } from "zod";

export const productsQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    category: z.string().trim().optional(),
    ecoMin: z.coerce.number().int().min(1).max(5).optional(),
  }),
});
