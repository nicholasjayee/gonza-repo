"use client";

import { useState } from 'react';
import { Customer } from '@/customers/types';
import { useCustomerData } from '../hooks/useCustomerData';
import { Eye, User, Phone, MapPin, Mail, ChevronRight, Edit2, Trash2, History } from 'lucide-react';
import Link from 'next/link';
import { CustomerFormModal } from './CustomerFormModal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { deleteCustomerAction } from '../../api/controller';

interface CustomerTableProps {
    searchQuery?: string;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ searchQuery = '' }) => {
    const { customers, loading, error, refresh } = useCustomerData();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
    );

    if (loading) return (
        <div className="grid place-items-center py-20">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading customers...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <p className="text-sm font-bold text-red-500">{error}</p>
        </div>
    );

    const handleDelete = async () => {
        if (!customerToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteCustomerAction(customerToDelete.id);
            if (res.success) {
                refresh();
                setCustomerToDelete(null);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (customers.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">No customers found</h3>
                <p className="text-muted-foreground text-sm">You haven't added any customers yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Location</th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                                {customer.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{customer.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            )}
                                            {customer.email && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{customer.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <MapPin className="w-3 h-3" />
                                            <span>{customer.city || customer.address || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/customers/show?id=${customer.id}`}
                                                className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/customers/history?id=${customer.id}`}
                                                className="p-2.5 hover:bg-blue-500/10 text-blue-500 rounded-xl transition-all"
                                                title="Purchase History"
                                            >
                                                <History className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-2.5 hover:bg-amber-500/10 text-amber-500 rounded-xl transition-all"
                                                title="Edit Customer"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setCustomerToDelete(customer)}
                                                className="p-2.5 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"
                                                title="Delete Customer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CustomerFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedCustomer(null);
                }}
                onSuccess={() => {
                    refresh();
                    setIsFormOpen(false);
                    setSelectedCustomer(null);
                }}
                initialData={selectedCustomer || undefined}
            />

            <ConfirmDialog
                isOpen={!!customerToDelete}
                title="Delete Customer?"
                description={`This will permanently remove ${customerToDelete?.name}. You will not be able to retrieve their history.`}
                confirmText="Delete Client"
                onConfirm={handleDelete}
                onCancel={() => setCustomerToDelete(null)}
                isLoading={isDeleting}
            />
        </>
    );
};
