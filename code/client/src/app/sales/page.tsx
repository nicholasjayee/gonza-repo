import { Metadata } from "next";
import SalesPage from "@/sales/ui/pages/SalesPage";

export const metadata: Metadata = {
    title: 'Sales Management | Gonza Client',
    description: 'Track orders, manage transactions, and monitor revenue across all channels.',
};

export default function Page() {
    return <SalesPage />;
}
