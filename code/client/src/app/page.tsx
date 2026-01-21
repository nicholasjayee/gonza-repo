import { Metadata } from "next";
import Dashboard from "@/dashboard/ui/pages/Dashboard";

export const metadata: Metadata = {
    title: 'Dashboard | Gonza Client',
    description: 'Overview of your business performance, key metrics, and real-time analytics.',
    openGraph: {
        title: 'Dashboard | Gonza Systems',
        description: 'Overview of your business performance, key metrics, and real-time analytics.',
        type: 'website',
        siteName: 'Gonza Systems',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Dashboard | Gonza Systems',
        description: 'Overview of your business performance, key metrics, and real-time analytics.',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <Dashboard />;
}
