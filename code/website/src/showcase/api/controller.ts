import { NextResponse } from 'next/server';
import { ShowcaseService } from './service';

export const ShowcaseController = {
    async getProducts() {
        try {
            const products = await ShowcaseService.getProducts();
            return NextResponse.json(products);
        } catch (error) {
            return NextResponse.json({ error: 'Failed' }, { status: 500 });
        }
    }
};
