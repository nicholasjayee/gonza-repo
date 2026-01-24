import { Metadata } from "next";
import NewSalePage from "@/sales/ui/pages/NewSalePage";

export const metadata: Metadata = {
    title: 'New Sale | Gonza',
    description: 'Create a new sale transaction.',
};

export default function Page() {
    return <NewSalePage />;
}
