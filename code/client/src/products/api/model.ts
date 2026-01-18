import { z } from 'zod';

export const ProductSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    category: z.string().optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
