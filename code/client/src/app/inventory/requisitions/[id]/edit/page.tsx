import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequisitionService } from "@/inventory/api/requisition-service";
import CreateRequisitionPage from "@/inventory/ui/pages/CreateRequisitionPage";

export const metadata: Metadata = {
    title: 'Edit Requisition | Gonza Systems',
    description: 'Modify an existing stock replenishment request.',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const requisition = await RequisitionService.getById(id);

    if (!requisition) {
        notFound();
    }

    // Transform to match RequisitionItem interface expected by the form
    const initialData = {
        priority: requisition.priority,
        notes: requisition.notes || '',
        items: requisition.items.map((item: any) => ({
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            // currentStock/minStock might be missing here if purely relying on history, 
            // but the form might re-fetch or just display what we have.
            // Ideally we'd fetch current product status too, but let's start with this.
        }))
    };

    return <CreateRequisitionPage requisitionId={requisition.id} initialData={initialData} />;
}
