/**
 * Maps spreadsheet headers (Title Case, spaces, etc.) to internal product field names.
 */
export const mapSpreadsheetHeaders = (data: any[]): any[] => {
    const mapping: Record<string, string> = {
        'id': 'ID',
        'internal id': 'ID',
        'identifier': 'ID',
        'name': 'name',
        'product name': 'name',
        'product': 'name',
        'sellingprice': 'sellingPrice',
        'selling price': 'sellingPrice',
        'selling (ugx)': 'sellingPrice',
        'price': 'sellingPrice',
        'costprice': 'costPrice',
        'cost price': 'costPrice',
        'cost (ugx)': 'costPrice',
        'stock': 'stock',
        'current stock': 'stock',
        'inventory': 'stock',
        'qty': 'stock',
        'quantity': 'stock',
        'initialstock': 'initialStock',
        'initial stock': 'initialStock',
        'minstock': 'minStock',
        'min stock': 'minStock',
        'minimum stock': 'minStock',
        'reorder level': 'minStock',
        'barcode': 'barcode',
        'sku': 'sku',
        'description': 'description',
        'category': 'categoryId',
        'supplier': 'supplierId'
    };

    return data.map(row => {
        const newRow: any = {};
        Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase().trim();
            const targetKey = mapping[normalizedKey] || normalizedKey;
            newRow[targetKey] = value;
        });
        return newRow;
    });
};
