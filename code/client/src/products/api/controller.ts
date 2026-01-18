import { NextResponse } from 'next/server';
import { ProductService } from './service';

export const ProductController = {
    async getProducts() {
        try {
            const products = await ProductService.fetchProducts();
            return NextResponse.json(products);
        } catch (error) {
            return NextResponse.json({ error: 'Failed' }, { status: 500 });
        }
    }
};
