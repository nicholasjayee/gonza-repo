import { Metadata } from "next";
import Dashboard from "@/dashboard/ui/pages/Dashboard";
import SalesPage from "@/sales/ui/pages/SalesPage";
import CustomersPage from "@/customers/ui/pages/CustomersPage";
import ProductsPage from "@/products/ui/pages/ProductsPage";
import InventoryPage from "@/inventory/ui/pages/InventoryPage";
import ExpensesPage from "@/expenses/ui/pages/ExpensesPage";
import FinancePage from "@/finance/ui/pages/FinancePage";
import MessagingPage from "@/messaging/ui/pages/MessagingPage";
import TasksPage from "@/tasks/ui/pages/TasksPage";
import BranchesPage from "@/branches/ui/pages/BranchesPage";
import SupportPage from "@/support/ui/pages/SupportPage";
import SettingsPage from "@/settings/ui/pages/SettingsPage";
import { use } from "react";

// SEO Configuration for each module
const seoConfig: Record<string, { title: string; description: string }> = {
    'dashboard': {
        title: 'Dashboard',
        description: 'Overview of your business performance, key metrics, and real-time analytics.',
    },
    'sales': {
        title: 'Sales Management',
        description: 'Track orders, manage transactions, and monitor revenue across all channels.',
    },
    'customers': {
        title: 'Customer Management',
        description: 'Manage your customer database, track interactions, and build lasting relationships.',
    },
    'products': {
        title: 'Product Catalog',
        description: 'Organize your product inventory, manage pricing, and track product performance.',
    },
    'inventory': {
        title: 'Inventory Control',
        description: 'Real-time stock tracking, automated alerts, and inventory optimization.',
    },
    'expenses': {
        title: 'Expense Tracking',
        description: 'Monitor business expenses, categorize costs, and maintain financial clarity.',
    },
    'finance': {
        title: 'Financial Ledger',
        description: 'Unified view of income, expenses, and financial health of your business.',
    },
    'messaging': {
        title: 'Messaging Center',
        description: 'Communicate with customers and team members from a unified inbox.',
    },
    'tasks': {
        title: 'Task Management',
        description: 'Organize workflows, assign tasks, and track progress across your team.',
    },
    'branches': {
        title: 'Branch Operations',
        description: 'Manage multi-location operations with centralized control and reporting.',
    },
    'support': {
        title: 'Support Center',
        description: 'Access help resources, submit tickets, and get assistance when you need it.',
    },
    'settings': {
        title: 'Settings',
        description: 'Configure your account preferences, integrations, and system settings.',
    },
};

// Route to Component mapping
const routes: Record<string, React.ComponentType> = {
    'sales': SalesPage,
    'customers': CustomersPage,
    'products': ProductsPage,
    'inventory': InventoryPage,
    'expenses': ExpensesPage,
    'finance': FinancePage,
    'messaging': MessagingPage,
    'tasks': TasksPage,
    'branches': BranchesPage,
    'support': SupportPage,
    'settings': SettingsPage,
};  

// Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const route = slug?.[0] || 'dashboard';
    const config = seoConfig[route] || seoConfig['dashboard'];

    return {
        title: `${config.title} | Gonza Client`,
        description: config.description,
        openGraph: {
            title: `${config.title} | Gonza Systems`,
            description: config.description,
            type: 'website',
            siteName: 'Gonza Systems',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${config.title} | Gonza Systems`,
            description: config.description,
        },
        robots: {
            index: false, // Private portal - don't index
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
