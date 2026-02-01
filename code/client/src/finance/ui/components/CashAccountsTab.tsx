'use client';

import { useEffect, useState } from 'react';
import { Plus, Wallet, TrendingUp, Eye, Pencil, Trash2 } from 'lucide-react';
import { getCashAccountsAction, deleteCashAccountAction } from '@/finance/api/controller';
import { CashAccountForm } from './CashAccountForm';
import { useMessage } from '@/shared/ui/Message';
import { useSettings } from '@/components/settings/api/SettingsContext';

interface CashAccount {
    id: string;
    name: string;
    description: string | null;
    currentBalance: number;
    isActive: boolean;
    createdAt: Date;
}

export function CashAccountsTab() {
    const [accounts, setAccounts] = useState<CashAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
    const [editingAccount, setEditingAccount] = useState<CashAccount | undefined>();
    const { showMessage, MessageComponent } = useMessage();
    const { currency } = useSettings();

    const fetchAccounts = async () => {
        setIsLoading(true);
        const res = await getCashAccountsAction();
        if (res.success && res.data) {
            setAccounts(res.data as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this cash account?')) return;

        const res = await deleteCashAccountAction(id);
        if (res.success) {
            showMessage('success', 'Account deleted');
            fetchAccounts();
        } else {
            showMessage('error', res.error || 'Failed to delete');
        }
    };

    const totalBalance = accounts
        .filter(a => a.isActive)
        .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    return (
        <div className="space-y-6">
            {MessageComponent}

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Balance</p>
                        <p className="text-3xl font-black mt-1">{totalBalance.toLocaleString()} {currency}</p>
                        <p className="text-xs text-muted-foreground mt-1">{accounts.filter(a => a.isActive).length} active accounts</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-primary" />
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-black">Cash Accounts</h2>
                <button
                    onClick={() => { setEditingAccount(undefined); setModalMode('create'); }}
                    className="h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Account
                </button>
            </div>

            {/* Accounts Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading accounts...</p>
                </div>
            ) : accounts.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                    <Wallet className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <h3 className="text-lg font-bold text-muted-foreground mt-4">No Cash Accounts</h3>
                    <p className="text-sm text-muted-foreground/60 mt-2">Create your first cash account to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => (
                        <div key={account.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{account.name}</h3>
                                    {account.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{account.description}</p>
                                    )}
                                </div>
                                {!account.isActive && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-muted rounded text-muted-foreground">
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-2xl font-black">{Number(account.currentBalance).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{currency}</span></p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditingAccount(account); setModalMode('edit'); }}
                                    className="flex-1 h-9 px-3 bg-muted hover:bg-muted/80 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(account.id)}
                                    className="h-9 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <CashAccountForm
                            mode={modalMode}
                            account={editingAccount}
                            onSuccess={() => { setModalMode(null); fetchAccounts(); }}
                            onCancel={() => setModalMode(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
