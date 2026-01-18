export interface InventoryItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    location?: string;
    minStockLevel: number;
    updatedAt: Date;
}
