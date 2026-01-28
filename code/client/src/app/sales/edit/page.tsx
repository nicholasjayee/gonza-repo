import { getSaleAction } from '@/sales/api/controller';
import { EditSalePage } from '@/sales/ui/pages/sale/EditSalePage';
import { Sale } from '@/sales/types';

export default async function Page({ searchParams }: { searchParams: { id: string } }) {
    const { id } = searchParams;
    if (!id) return <div className="p-10 text-center text-red-500">No sale ID provided.</div>;

    const res = await getSaleAction(id);

    if (!res.success || !res.data) {
        return <div className="p-10 text-center text-red-500">Sale not found.</div>;
    }

    return <EditSalePage sale={res.data as unknown as Sale} />;
}
