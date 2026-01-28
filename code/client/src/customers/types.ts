export interface Customer {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    notes?: string | null;
    branchId?: string | null;
    adminId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCustomerInput {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    notes?: string;
}
