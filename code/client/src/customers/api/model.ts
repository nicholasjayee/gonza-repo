import { z } from 'zod';

export const CustomerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
