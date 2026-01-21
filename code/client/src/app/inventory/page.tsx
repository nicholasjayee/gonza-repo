import { Metadata } from "next";
import InventoryPage from "@/inventory/ui/pages/InventoryPage";

export const metadata: Metadata = {
    title: 'Inventory Control | Gonza Client',
    description: 'Real-time stock tracking, automated alerts, and inventory optimization.',
};

export default function Page() {
    return <InventoryPage />;
}
