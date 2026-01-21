import { Metadata } from "next";
import SupportPage from "@/support/ui/pages/SupportPage";

export const metadata: Metadata = {
    title: 'Support Center | Gonza Client',
    description: 'Access help resources, submit tickets, and get assistance when you need it.',
};

export default function Page() {
    return <SupportPage />;
}
