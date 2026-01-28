import { Metadata } from "next";
import CreateRequisitionPage from "@/inventory/ui/pages/CreateRequisitionPage";

export const metadata: Metadata = {
    title: 'New Requisition | Gonza Systems',
    description: 'Submit a new stock replenishment request for your branch.',
};

export default function Page() {
    return <CreateRequisitionPage />;
}
