import { Metadata } from "next";
import FinancePage from "@/finance/ui/pages/FinancePage";

export const metadata: Metadata = {
    title: 'Financial Ledger | Gonza Client',
    description: 'Unified view of income, expenses, and financial health of your business.',
};

export default function Page() {
    return <FinancePage />;
}
