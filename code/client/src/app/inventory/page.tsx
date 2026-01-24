import { getActiveBranch } from "@/branches/api/branchContext";
import { getSubBranchesAction } from "@/dashboard/api/controller";

export const metadata: Metadata = {
    title: 'Inventory Control | Gonza Client',
    description: 'Real-time stock tracking, automated alerts, and inventory optimization.',
};

export default async function Page() {
    const { branchType } = await getActiveBranch();

    let branches: { id: string; name: string }[] = [];
    if (branchType === 'MAIN') {
        const branchesRes = await getSubBranchesAction();
        if (branchesRes.success && branchesRes.data) {
            branches = branchesRes.data as { id: string; name: string }[];
        }
    }

    return <InventoryPage branchType={branchType} branches={branches} />;
}
