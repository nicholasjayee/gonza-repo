import { NextResponse } from 'next/server';
import { InventoryService } from './service';

export const InventoryController = {
    async getItems() {
        try {
            const items = await InventoryService.fetchItems();
            return NextResponse.json(items);
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
        }
    },

    async updateStock(id: string, count: number) {
        try {
            const updated = await InventoryService.updateStock(id, count);
            return NextResponse.json(updated);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
};
