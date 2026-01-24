import { getSalesAction } from '@/sales/api/controller';
import { SalesListPage } from '@/sales/ui/pages/sale/SalesListPage';
import { getActiveBranch } from '@/branches/api/branchContext';
import { getSubBranchesAction } from '@/dashboard/api/controller';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
    const { branchType } = await getActiveBranch();
    const salesRes = await getSalesAction();
    const sales = salesRes.success && salesRes.data ? salesRes.data : [];

    let branches: { id: string; name: string }[] = [];
    if (branchType === 'MAIN') {
        const branchesRes = await getSubBranchesAction();
        if (branchesRes.success && branchesRes.data) {
            branches = branchesRes.data as { id: string; name: string }[];
        }
    }

    return <SalesListPage initialSales={sales} branchType={branchType} branches={branches} />;
}
