import { Metadata } from "next";
import { getActiveBranch } from "@/branches/api/branchContext";
import DashboardPage from "@/dashboard/ui/pages/DashboardPage";

export const metadata: Metadata = {
    // ... (metadata unchanged)
};

export default async function Page() {
    const { branchType } = await getActiveBranch();
    return <DashboardPage branchType={branchType as any} />;
}
