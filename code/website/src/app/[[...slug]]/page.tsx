import HomePage from "@/showcase/ui/pages/HomePage";
import PolicyPage from "@/showcase/ui/pages/PolicyPage";
import TermsPage from "@/showcase/ui/pages/TermsPage";
import { use } from "react";
import { Metadata } from "next";

// Route Config
const routes: Record<string, React.ComponentType> = {
    'policy': PolicyPage,
    'terms': TermsPage,
};

// SEO Configuration
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const route = slug?.[0] || 'home';

    const titles: Record<string, string> = {
        'home': 'Home',
        'policy': 'Privacy Policy',
        'terms': 'Terms of Service',
    };

    return {
        title: `${titles[route] || 'Home'} | Gonza Systems`,
        description: 'The ultimate business management platform.',
    };
}

export default function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = use(params);
    const route = slug?.[0];

    // Default to Home if no route is provided (i.e. root /)
    if (!route) {
        return <HomePage />;
    }

    const PageComponent = routes[route];
    if (PageComponent) {
        return <PageComponent />;
    }

    // Fallback to Home
    return <HomePage />;
}
