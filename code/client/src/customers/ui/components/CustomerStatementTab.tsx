"use client";

import React, { useEffect, useState } from 'react';
import { getCustomerStatementAction } from '@/customers/api/controller';
import { StatementEntry } from '@/customers/api/statement-service';
import { format } from 'date-fns';
import { Download, Receipt, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';

interface CustomerStatementTabProps {
    customerId: string;
}

export const CustomerStatementTab: React.FC<CustomerStatementTabProps> = ({ customerId }) => {
    const [statement, setStatement] = useState<StatementEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatement() {
            setLoading(true);
            try {
                const res = await getCustomerStatementAction(customerId);
                if (res.success && res.data) {
                    setStatement(res.data as StatementEntry[]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStatement();
    }, [customerId]);

    const handleExportCSV = () => {
        if (statement.length === 0) return;

        const headers = ["Date", "Description", "Reference", "Type", "Debit (+)", "Credit (-)", "Balance"];
        const rows = statement.map(entry => [
            format(new Date(entry.date), 'yyyy-MM-dd HH:mm'),
            entry.description.replace(/,/g, ' '),
            entry.reference,
            entry.type,
            entry.debit,
            entry.credit,
            entry.balance
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Statement_${customerId}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-muted-foreground">Calculating ledger balance...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-black tracking-tight">Account Statement</h3>
                    <p className="text-xs text-muted-foreground font-medium">A chronological record of debits and credits</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="h-10 px-4 bg-foreground text-background font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-foreground/10"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                </button>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-4 mb-4">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed text-blue-700/80">
                    This statement tracks all purchase invoices (debits) and payments made (credits).
                    Positive balances indicate outstanding debt owed by the customer.
                </p>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transaction Details</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Debit (+)</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Credit (-)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {statement.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xs text-foreground">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(entry.date), 'hh:mm a')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        {entry.type === 'INVOICE' ? (
                                            <ArrowUpCircle className="w-8 h-8 text-rose-500 bg-rose-500/10 p-1.5 rounded-xl" />
                                        ) : (
                                            <ArrowDownCircle className="w-8 h-8 text-emerald-500 bg-emerald-500/10 p-1.5 rounded-xl" />
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm text-foreground">{entry.description}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Ref: #{entry.reference}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right font-bold text-sm">
                                    {entry.debit > 0 ? `UGX ${entry.debit.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-6 py-5 text-right font-bold text-sm text-emerald-600">
                                    {entry.credit > 0 ? `UGX ${entry.credit.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className={`font-black text-sm ${entry.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        UGX {entry.balance.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {statement.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <Receipt className="w-12 h-12" />
                                        <p className="text-sm font-bold italic">No financial activity found for this customer.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
