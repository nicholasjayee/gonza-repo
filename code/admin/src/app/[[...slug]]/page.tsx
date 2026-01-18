import { Metadata } from "next";
import Dashboard from "@/dashboard/ui/pages/Dashboard";
import UsersPage from "@/users/ui/pages/UsersPage";
import AnalyticsPage from "@/analytics/ui/pages/AnalyticsPage";
import SettingsPage from "@/settings/ui/pages/SettingsPage";
import { use } from "react";

// SEO Configuration for admin modules
const seoConfig: Record<string, { title: string; description: string }> = {
    'dashboard': {
        title: 'Admin Dashboard',
        description: 'System overview, health metrics, and administrative controls.',
    },
    'users': {
        title: 'User Management',
        description: 'Manage system users, roles, permissions, and access controls.',
    },
    'analytics': {
        title: 'System Analytics',
        description: 'Deep insights into system performance, usage patterns, and trends.',
    },
    'settings': {
        title: 'System Settings',
        description: 'Configure global system parameters, integrations, and security policies.',
    },
};

// Route to Component mapping
const routes: Record<string, React.ComponentType> = {
    'users': UsersPage,
    'analytics': AnalyticsPage,
    'settings': SettingsPage,
};

// Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const route = slug?.[0] || 'dashboard';
    const config = seoConfig[route] || seoConfig['dashboard'];

    return {
        title: `${config.title} | Gonza Admin`,
        description: config.description,
        openGraph: {
            title: `${config.title} | Gonza Admin Terminal`,
            description: config.description,
            type: 'website',
            siteName: 'Gonza Systems Admin',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${config.title} | Gonza Admin`,
            description: config.description,
        },
        robots: {
            index: false, // Admin portal - never index
            follow: false,
        },
    };
}

export default function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = use(params);
    const route = slug?.[0];

    if (!route) {
        return <Dashboard />;
    }

    const PageComponent = routes[route];
    if (PageComponent) {
        return <PageComponent />;
    }

    // Fallback for unknown routes
    return <Dashboard />;
}
