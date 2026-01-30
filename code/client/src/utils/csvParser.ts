
export interface CSVProductRow {
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    minStock: number;
    costPrice: number;
    sellingPrice: number;
    category?: string;
    supplier?: string;
    image?: string;
    "Creation Date"?: string;
}

export interface ValidationError {
    row: number;
    column: string;
    message: string;
    value: unknown;
}

export const parseCSV = async (_file: File): Promise<{ validRows: CSVProductRow[]; errors: ValidationError[]; totalRows: number }> => {
    return { validRows: [], errors: [], totalRows: 0 };
};

export const generateErrorLogCSV = (_errors: ValidationError[]) => {
    return "";
};

export const extractUniqueCategories = (_data: CSVProductRow[]): string[] => {
    return [];
};
