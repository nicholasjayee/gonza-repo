import { getActiveBranch } from "@/branches/api/branchContext";
import { getSubBranchesAction } from "@/dashboard/api/controller";

export const metadata: Metadata = {
    title: 'Expense Tracking | Gonza Client',
    description: 'Monitor business expenses, categorize costs, and maintain financial clarity.',
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

    return <ExpensesPage initialBranchType={branchType} initialBranches={branches} />;
}
