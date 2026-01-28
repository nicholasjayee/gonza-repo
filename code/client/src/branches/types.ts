export interface Branch {
    id: string;
    name: string;
    location: string;
    phone?: string;
    email?: string;
    type: 'MAIN' | 'SUB';
    accessPassword?: string;
    adminId: string;
}
