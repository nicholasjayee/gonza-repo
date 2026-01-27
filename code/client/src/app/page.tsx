import { Metadata } from "next";
import { getActiveBranch } from "@/branches/api/branchContext";
import { getBranchAction } from "@/branches/api/controller";
import DashboardPage from "@/dashboard/ui/pages/DashboardPage";

export const metadata: Metadata = {
    title: "Dashboard | Gonza Systems",
};

export default async function Page() {
    const { branchId, branchType } = await getActiveBranch();

    let branchName = "";
    if (branchId) {
        const branchRes = await getBranchAction(branchId);
        if (branchRes.success && branchRes.data) {
            branchName = (branchRes.data as any).name;
        }
    }

    return <DashboardPage branchType={branchType as any} branchName={branchName} />;
}
