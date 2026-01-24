import { Metadata } from "next";
import RestockPage from "@/inventory/ui/pages/RestockPage";

export const metadata: Metadata = {
    title: 'Batch Restock | Gonza Systems',
    description: 'Efficiently update your inventory levels.',
};

export default function Page() {
    return <RestockPage />;
}
