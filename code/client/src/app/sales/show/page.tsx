import { getSaleAction } from '@/sales/api/controller';
import { getSettingsAction } from '@/settings/api/controller';
import { SaleDetailsPage } from '@/sales/ui/pages/sale/SaleDetailsPage';
import { Sale, BranchSettings } from '@/sales/types';

export default async function Page({ searchParams }: { searchParams: { id: string } }) {
    const { id } = searchParams;
    if (!id) return <div className="p-10 text-center text-red-500">No sale ID provided.</div>;

    const [saleRes, settingsRes] = await Promise.all([
        getSaleAction(id),
        getSettingsAction()
    ]);
    
    if (!saleRes.success || !saleRes.data) {
        return <div className="p-10 text-center text-red-500">Sale not found.</div>;
    }

    const settings = settingsRes.success && settingsRes.data ? settingsRes.data as BranchSettings : null;
    const currency = settings?.currency || 'UGX';

    return <SaleDetailsPage sale={saleRes.data as unknown as Sale} currency={currency} />;
}
