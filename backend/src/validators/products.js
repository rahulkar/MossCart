import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const productsQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    category: z.string().trim().optional(),
    ecoMin: z.coerce.number().int().min(1).max(5).optional(),
    page: positiveInt.default(1),
    pageSize: positiveInt.default(12),
  }),
});

const specSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const productBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  subtitle: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  description: z.string().trim().min(1, "Description is required"),
  priceCents: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().trim().optional(),
  category: z.string().trim().min(1, "Category is required"),
  ecoScore: z.coerce.number().int().min(1).max(5),
  stock: z.coerce.number().int().nonnegative(),
  highlights: z.array(z.string().min(1)).optional(),
  specs: z.array(specSchema).optional(),
});

export const createProductSchema = z.object({
  body: productBodySchema,
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: productBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update",
  }),
});
