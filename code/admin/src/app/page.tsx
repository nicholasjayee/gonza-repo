import { Metadata } from "next";
import Dashboard from "@/dashboard/ui/pages/Dashboard";

export const metadata: Metadata = {
    title: 'Admin Dashboard | Gonza Admin',
    description: 'System overview, health metrics, and administrative controls.',
    openGraph: {
        title: 'Admin Dashboard | Gonza Admin Terminal',
        description: 'System overview, health metrics, and administrative controls.',
        type: 'website',
        siteName: 'Gonza Systems Admin',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Admin Dashboard | Gonza Admin',
        description: 'System overview, health metrics, and administrative controls.',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <Dashboard />;
}
