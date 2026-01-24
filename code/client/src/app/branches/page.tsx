import { Metadata } from "next";
import BranchesPage from "@/branches/ui/pages/BranchesPage";
import { getActiveBranch } from "@/branches/api/branchContext";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: 'Branch Operations | Gonza Client',
    description: 'Manage multi-location operations with centralized control and reporting.',
};

export default async function Page() {
    // Strict Server-Side Route Guard
    const { branchType } = await getActiveBranch();

    if (branchType !== 'MAIN') {
        redirect('/');
    }

    return <BranchesPage />;
}
