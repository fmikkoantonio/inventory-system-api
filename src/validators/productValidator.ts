import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),

  sku: z.string().min(1),

  description: z.string().optional(),

  quantity: z.coerce.number().min(0),

  price: z.coerce.number().min(0),

  category: z.string().optional(),

  image: z.string().optional(),
});
