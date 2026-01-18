import { z } from 'zod';

export const InventorySchema = z.object({
    productId: z.string(),
    quantity: z.number().int().nonnegative(),
    minStockLevel: z.number().int().nonnegative(),
});

export type InventoryInput = z.infer<typeof InventorySchema>;
