'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { createCashAccountAction, updateCashAccountAction } from '@/finance/api/controller';
import { useMessage } from '@/shared/ui/Message';

interface CashAccountFormProps {
    mode: 'create' | 'edit';
    account?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CashAccountForm({ mode, account, onSuccess, onCancel }: CashAccountFormProps) {
    const [name, setName] = useState(account?.name || '');
    const [description, setDescription] = useState(account?.description || '');
    const [initialBalance, setInitialBalance] = useState(account?.initialBalance || 0);
    const [isActive, setIsActive] = useState(account?.isActive ?? true);
    const [isSaving, setIsSaving] = useState(false);
    const { showMessage, MessageComponent } = useMessage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const res = mode === 'create'
            ? await createCashAccountAction({ name, description, initialBalance: Number(initialBalance) })
            : await updateCashAccountAction(account.id, { name, description, isActive });

        if (res.success) {
            showMessage('success', mode === 'create' ? 'Account created' : 'Account updated');
            setTimeout(onSuccess, 500);
        } else {
            showMessage('error', res.error || 'Operation failed');
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8">
            {MessageComponent}

            <div className="mb-6">
                <h2 className="text-xl font-black">{mode === 'create' ? 'New Cash Account' : 'Edit Account'}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                    {mode === 'create' ? 'Create a new cash account for your branch' : 'Update account details'}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Account Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Main Cash, Bank Account, Mobile Money..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full  px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={3}
                        placeholder="Optional details about this account..."
                    />
                </div>

                {mode === 'create' && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                            Initial Balance
                        </label>
                        <input
                            type="number"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            className="w-full h-11 px-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0"
                            min="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Starting balance for this account (UGX)</p>
                    </div>
                )}

                {mode === 'edit' && (
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                            Account is active
                        </label>
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="flex-1 h-11 rounded-xl border border-border font-bold text-xs uppercase tracking-widest hover:bg-muted transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving || !name}
                    className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
                </button>
            </div>
        </form>
    );
}
