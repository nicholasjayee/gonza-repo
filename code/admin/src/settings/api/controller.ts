import { NextResponse } from 'next/server';

export const InventoryController = {
    async getReport() {
        return NextResponse.json({
            totalValue: 15400.50,
            lowStockItems: 5,
            outOfStock: 2
        });
    }
};
