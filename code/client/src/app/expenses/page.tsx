import { Metadata } from "next";
import ExpensesPage from "@/expenses/ui/pages/ExpensesPage";

export const metadata: Metadata = {
    title: 'Expense Tracking | Gonza Client',
    description: 'Monitor business expenses, categorize costs, and maintain financial clarity.',
};

export default function Page() {
    return <ExpensesPage />;
}
