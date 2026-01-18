'use server';

import { ProductService } from './service';

export async function getProductsAction() {
    try {
        const data = await ProductService.getAll();
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, error: 'Failed to fetch products' };
    }
}
