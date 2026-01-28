import { db } from '@gonza/shared/prisma/db';
import { Sale } from '@/sales/types';

export interface StatementEntry {
    date: Date;
    description: string;
    reference: string;
    type: 'INVOICE' | 'PAYMENT';
    debit: number;  // Increase balance (+ spent)
    credit: number; // Decrease balance (- paid)
    balance: number;
}

export class StatementService {
    /**
     * Generates a chronological ledger for a specific customer
     */
    static async getStatement(customerId: string): Promise<StatementEntry[]> {
        // 1. Fetch all sales for this customer
        const sales = await db.sale.findMany({
            where: { customerId },
            orderBy: { createdAt: 'asc' }, // Sort by oldest first to calculate running balance
        }) as unknown as Sale[];

        const ledger: StatementEntry[] = [];
        let runningBalance = 0;

        // 2. Transform sales into ledger entries
        for (const sale of sales) {
            // Entry A: The Invoice (Debit)
            const debitAmount = Number(sale.total);
            runningBalance += debitAmount;

            ledger.push({
                date: new Date(sale.createdAt),
                description: `Invoice for Sale #${sale.saleNumber}`,
                reference: sale.saleNumber,
                type: 'INVOICE',
                debit: debitAmount,
                credit: 0,
                balance: runningBalance
            });

            // Entry B: The Payment (Credit) - if any initial payment was made
            const creditAmount = Number(sale.amountPaid);
            if (creditAmount > 0) {
                runningBalance -= creditAmount;

                ledger.push({
                    // We use updatedAt as a proxy for the payment date 
                    // since we don't have a separate Payment model yet.
                    date: new Date(sale.updatedAt),
                    description: `Payment for Sale #${sale.saleNumber}`,
                    reference: sale.saleNumber,
                    type: 'PAYMENT',
                    debit: 0,
                    credit: creditAmount,
                    balance: runningBalance
                });
            }
        }

        // 3. Return sorted by date (newest first for display, though calculated oldest first)
        return ledger.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
}
