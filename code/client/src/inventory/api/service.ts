export const InventoryService = {
    async fetchItems() {
        return [
            { id: '1', name: 'Premium Widget', stock: 124, price: 45.99 },
            { id: '2', name: 'Elite Gadget', stock: 8, price: 120.00 },
            { id: '3', name: 'Standard Tool', stock: 540, price: 12.50 }
        ];
    },

    async updateStock(id: string, count: number) {
        console.log(`Inventory Update: ${id} set to ${count}`);
        return { id, stock: count };
    }
};
