import { Metadata } from "next";
import AnalyticsPage from "@/analytics/ui/pages/AnalyticsPage";

export const metadata: Metadata = {
    title: 'System Analytics | Gonza Admin',
    description: 'Deep insights into system performance, usage patterns, and trends.',
};

export default function Page() {
    return <AnalyticsPage />;
}
