import { Metadata } from "next";
import CustomersPage from "@/customers/ui/pages/CustomersPage";

export const metadata: Metadata = {
    title: 'Customer Management | Gonza Client',
    description: 'Manage your customer database, track interactions, and build lasting relationships.',
};

export default function Page() {
    return <CustomersPage />;
}
