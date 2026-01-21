import { Metadata } from "next";
import BranchesPage from "@/branches/ui/pages/BranchesPage";

export const metadata: Metadata = {
    title: 'Branch Operations | Gonza Client',
    description: 'Manage multi-location operations with centralized control and reporting.',
};

export default function Page() {
    return <BranchesPage />;
}
