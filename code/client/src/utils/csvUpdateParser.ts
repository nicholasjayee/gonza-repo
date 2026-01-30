
export interface CSVProductUpdateRow {
    "Item Number": string;
    "Name"?: string;
    "Category"?: string;
    "Quantity"?: string;
    "Cost Price"?: string;
    "Selling Price"?: string;
    "Supplier"?: string;
    "Description"?: string;
}

export interface UpdateValidationError {
    row: number;
    column: string;
    message: string;
    value: unknown;
}

export const parseCSVUpdate = (_text: string): { validRows: CSVProductUpdateRow[]; errors: UpdateValidationError[]; totalRows: number } => {
    return { validRows: [], errors: [], totalRows: 0 };
};

export const generateUpdateErrorLogCSV = (_errors: UpdateValidationError[]) => {
    return "";
};

export const extractUpdateCategories = (_data: CSVProductUpdateRow[]): string[] => {
    return [];
};
