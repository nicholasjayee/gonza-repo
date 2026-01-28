"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    HelpCircle,
    Book,
    LayoutDashboard,
    ShoppingCart,
    Users,
    Package,
    Briefcase,
    Settings,
    ChevronRight,
    Search,
    MessageSquare,
    Shield,
    Smartphone,
    Printer,
    ArrowRight
} from 'lucide-react';

type SectionType = 'overview' | 'dashboard' | 'sales' | 'customers' | 'inventory' | 'finance' | 'settings';

interface DocSectionProps {
    title: string;
    description: string;
    features: string[];
    guides: { title: string; steps: string[] }[];
    tips: string[];
}

export default function SupportPage() {
    const [activeSection, setActiveSection] = useState<SectionType>('overview');

    const sections = [
        { id: 'overview' as SectionType, label: 'General Overview', icon: <Book className="w-4 h-4" /> },
        { id: 'dashboard' as SectionType, label: 'Dashboards', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'sales' as SectionType, label: 'Sales & Orders', icon: <ShoppingCart className="w-4 h-4" /> },
        { id: 'customers' as SectionType, label: 'CRM & Customers', icon: <Users className="w-4 h-4" /> },
        { id: 'inventory' as SectionType, label: 'Inventory & Products', icon: <Package className="w-4 h-4" /> },
        { id: 'finance' as SectionType, label: 'Finance & P&L', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'settings' as SectionType, label: 'Settings & Branding', icon: <Settings className="w-4 h-4" /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <DocSection
                        title="Welcome to Gonza Enterprise 🚀"
                        description="Gonza is an all-in-one business management system designed to streamline your branch operations, from sales and stock tracking to financial reporting."
                        features={[
                            "Multi-branch management with specialized dashboards",
                            "Real-time inventory tracking and stock transfers",
                            "Comprehensive sales management with quote-to-sale flow",
                            "Integrated financial reporting (Profit & Loss)",
                            "WhatsApp and SMS communication channels",
                            "Custom branding for every branch (logos, signatures)"
                        ]}
                        guides={[
                            {
                                title: "Getting Started",
                                steps: [
                                    "Log in to your account through the secure portal.",
                                    "Use the sidebar to navigate between different business modules.",
                                    "Switch between branches (if authorized) using the branch selector in the top-right navigation.",
                                    "Check your notifications for recent activities and tasks."
                                ]
                            }
                        ]}
                        tips={[
                            "Use the Dashboard to get a quick snapshot of your daily performance.",
                            "Keep your branch settings up to date for consistent branding on receipts.",
                            "Use the search bars at the top of every table to quickly find data."
                        ]}
                    />
                );
            case 'dashboard':
                return (
                    <DocSection
                        title="Dashboards & Analytics 📊"
                        description="Understand your business performance at a glance through our specialized analytics views."
                        features={[
                            "Main Branch Overview: Aggregated metrics from all locations.",
                            "Sub-Branch Dashboards: Focused operational metrics.",
                            "Real-time sales and revenue tracking.",
                            "Activity widgets for Low Stock, Recent Sales, and New Customers.",
                            "Interactive branch filters for strategic drill-down."
                        ]}
                        guides={[
                            {
                                title: "Using the Branch Filter",
                                steps: [
                                    "Navigate to the main Dashboard.",
                                    "For Main Branch users, click the 'Branch Filter' dropdown in the header.",
                                    "Select a specific sub-branch to see its individual performance.",
                                    "Select 'All Branches' to revert to the aggregated company-wide view."
                                ]
                            }
                        ]}
                        tips={[
                            "The Dashboard refreshes data in the background, ensuring you always see the latest figures.",
                            "Check the 'Low Stock' widget daily to stay ahead of restocking needs."
                        ]}
                    />
                );
            case 'sales':
                return (
                    <DocSection
                        title="Sales & Order Management 💰"
                        description="The core of your business operations. Manage transactions, handle payments, and issue quotes."
                        features={[
                            "Full Point of Sale (POS) interface with barcode support.",
                            "Quote-to-Order conversion flow.",
                            "Multiple payment status tracking (Paid, Partial, Quote).",
                            "Digital and thermal receipt generation.",
                            "Flexible discounting (Percentage or Fixed amount).",
                            "Cash account integration for transparent money tracking."
                        ]}
                        guides={[
                            {
                                title: "Creating a New Sale",
                                steps: [
                                    "Go to the Sales module and click 'New Sale'.",
                                    "Select or add a customer to the transaction.",
                                    "Search for products or use a barcode scanner to add items.",
                                    "Apply discounts and taxes if necessary.",
                                    "Set the payment status and amount paid.",
                                    "Select the destination Cash Account for the funds.",
                                    "Submit the sale and choose to print or share the receipt."
                                ]
                            }
                        ]}
                        tips={[
                            "Use the 'Quote' status for customer inquiries to reserve items without deducting stock.",
                            "Always link sales to a Cash Account to ensure your Finance modules are accurate."
                        ]}
                    />
                );
            case 'customers':
                return (
                    <DocSection
                        title="Customer Management (CRM) 👥"
                        description="Build lasting relationships with your clients by tracking their history and spending habits."
                        features={[
                            "Detailed customer profiles and contact management.",
                            "Full transaction history for ogni client.",
                            "Downloadable Customer Statements (Excel/CSV).",
                            "Credit and balance tracking.",
                            "Direct WhatsApp and Call buttons from the CRM."
                        ]}
                        guides={[
                            {
                                title: "Generating a Account Statement",
                                steps: [
                                    "Navigate to the Customers module.",
                                    "Click on 'History/Statement' for a specific customer.",
                                    "Switch to the 'Statement' tab.",
                                    "Use the date filters to select the desired period.",
                                    "Click 'Export CSV' to download the formatted report."
                                ]
                            }
                        ]}
                        tips={[
                            "Check a customer's 'Recent Sales' to understand their preferences.",
                            "Maintain accurate contact numbers to use the direct messaging features."
                        ]}
                    />
                );
            case 'inventory':
                return (
                    <DocSection
                        title="Products & Inventory Control 📦"
                        description="Manage your stock levels, transfer items between locations, and never run out of supplies."
                        features={[
                            "Inventory Analytics: Valuation, Cost vs. Selling Price analysis.",
                            "Branch Stock Transfers with atomic transactional logic.",
                            "Smart Requisition system with 'Low Stock' suggestions.",
                            "Batch Restock module with supplier tracking.",
                            "Product history logs for every stock movement.",
                            "Excel/CSV bulk upload for massive inventory updates."
                        ]}
                        guides={[
                            {
                                title: "Transferring Stock Between Branches",
                                steps: [
                                    "Go to the 'Transfer' module.",
                                    "Select the 'From' (Source) and 'To' (Destination) branches.",
                                    "Choose the products you wish to move.",
                                    "Enter the quantities (system will check for available stock).",
                                    "Complete the transfer; stock will be automatically deducted from source and added to destination."
                                ]
                            },
                            {
                                title: "Using the Restock Module",
                                steps: [
                                    "Access the 'Restock' module from the Inventory page.",
                                    "Scan or select products to add to the restock list.",
                                    "Optionally link the restock to a Supplier.",
                                    "Enter the new units received.",
                                    "Confirm the restock to update inventory and log the history."
                                ]
                            }
                        ]}
                        tips={[
                            "Use the 'Items Sold Analysis' to identify which products are moving even when out of stock.",
                            "Always perform transfers through the system to keep branch-specific valuations accurate."
                        ]}
                    />
                );
            case 'finance':
                return (
                    <DocSection
                        title="Finance & Cash Management 💵"
                        description="Monitor your cash flow, track expenses, and view your branch's profitability."
                        features={[
                            "Multiple Cash Account management (Petty Cash, Bank, Til, etc.).",
                            "Real-time Profit & Loss (P&L) reporting.",
                            "Expense tracking by category and branch.",
                            "Automatic cash account balance updates from sales and expenses.",
                            "Bulk expense import and data export (PDF/CSV)."
                        ]}
                        guides={[
                            {
                                title: "Reviewing Branch Profitability",
                                steps: [
                                    "Navigate to the 'Finance' module.",
                                    "The 'Profit & Loss' tab provides a summary of Income vs. Expenses.",
                                    "Use the date presets (This Month, Last Quarter) to filter reports.",
                                    "Observe the 'Net Profit' to gauge operational success.",
                                    "Check the 'Expenses by Category' chart to identify cost-saving opportunities."
                                ]
                            }
                        ]}
                        tips={[
                            "Reconcile your physical cash with the 'Cash Accounts' balances regularly.",
                            "Categorize every expense correctly to get accurate reporting in the P&L module."
                        ]}
                    />
                );
            case 'settings':
                return (
                    <DocSection
                        title="Settings & Personalization ⚙️"
                        description="Customize the system to reflect your brand and operational requirements."
                        features={[
                            "General Settings: Business name, currency, and contact info.",
                            "Branding: Custom logos and digital signatures.",
                            "Thermal Printer configuration.",
                            "System-wide currency globalization.",
                            "Security and account management."
                        ]}
                        guides={[
                            {
                                title: "Updating Branch Branding",
                                steps: [
                                    "Go to the 'Settings' module.",
                                    "Switch to the 'Branding' tab.",
                                    "Upload your company logo (appears on receipts and reports).",
                                    "Upload a digital signature if you wish to sign quotes/receipts automatically.",
                                    "Save changes to apply them to all system-generated documents."
                                ]
                            }
                        ]}
                        tips={[
                            "Ensure your Business Email and Phone are correct, as they are used in automated communications.",
                            "Choose your base currency carefully as it affects all financial modules."
                        ]}
                    />
                );
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tight">Support Center</h1>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Everything you need to know about operating Gonza Enterprise</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        className="w-full h-12 pl-11 pr-4 bg-card border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:w-72 shrink-0">
                    <div className="bg-card border border-border rounded-[2rem] p-4 sticky top-8 shadow-sm">
                        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Modules & Guides</p>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${activeSection === section.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={activeSection === section.id ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}>
                                            {section.icon}
                                        </div>
                                        <span className="text-sm font-bold">{section.label}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-border px-4">
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                <MessageSquare className="w-5 h-5 text-primary mb-2" />
                                <p className="text-xs font-bold text-foreground mb-1">Need human help?</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">Contact our technical team for personalized assistance.</p>
                                <button className="w-full py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function DocSection({ title, description, features, guides, tips }: DocSectionProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Intro */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black tracking-tight mb-3">{title}</h2>
                        <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">{description}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-2xl border border-border hidden md:block">
                        <Shield className="w-10 h-10 text-primary/20" />
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
            </div>

            {/* Grid for Features & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Features */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary px-2">Key Capabilities</h3>
                    <div className="bg-card border border-border rounded-[2rem] p-6 space-y-4 shadow-sm">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 group">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                                <p className="text-sm font-medium text-foreground/80 leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-600 px-2">Expert Tips</h3>
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-6 space-y-4">
                        {tips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <p className="text-xs font-bold text-orange-800/80 leading-relaxed italic">{tip}</p>
                            </div>
                        ))}
                    </div>
                    {/* Extra Visual Helper */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 flex items-center gap-4">
                        <Smartphone className="w-8 h-8 text-blue-500/20" />
                        <p className="text-[10px] font-medium text-blue-800/60 leading-relaxed uppercase tracking-wider">
                            Mobile documentation available in the app settings.
                        </p>
                    </div>
                </div>
            </div>

            {/* Step-by-Step Guides */}
            <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary px-2">How-To Guides</h3>
                <div className="grid grid-cols-1 gap-6">
                    {guides.map((guide, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm hover:border-primary/20 transition-all group">
                            <div className="px-8 py-5 bg-muted/30 border-b border-border flex items-center justify-between">
                                <h4 className="font-black italic text-lg">{guide.title}</h4>
                                <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">Guide</div>
                            </div>
                            <div className="p-8 space-y-6">
                                {guide.steps.map((step, sIdx) => (
                                    <div key={sIdx} className="flex items-start gap-6 relative">
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-primary/10 text-primary flex items-center justify-center font-black italic shadow-inner shrink-0 scale-90 group-hover:scale-100 transition-transform">
                                            {sIdx + 1}
                                        </div>
                                        {sIdx < guide.steps.length - 1 && (
                                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gradient-to-b from-primary/10 to-transparent" />
                                        )}
                                        <p className="pt-2.5 text-sm font-medium text-muted-foreground leading-relaxed flex-1">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-4 flex justify-end">
                                    <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all">
                                        Still stuck? Watch Video <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resources Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResourceCard
                    icon={<Printer className="w-5 h-5" />}
                    title="Printer Setup"
                    desc="Configure Bluetooth & Thermal printers."
                    link="/settings"
                />
                <ResourceCard
                    icon={<Smartphone className="w-5 h-5" />}
                    title="Mobile App"
                    desc="Manage your store on the go."
                    link="#"
                />
                <ResourceCard
                    icon={<Shield className="w-5 h-5" />}
                    title="Privacy & Data"
                    desc="How we protect your business info."
                    link="#"
                />
            </div>
        </div>
    );
}

function ResourceCard({ icon, title, desc, link }: { icon: React.ReactNode, title: string, desc: string, link: string }) {
    return (
        <Link href={link} className="bg-background border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                {icon}
            </div>
            <div>
                <h5 className="font-bold text-sm mb-1">{title}</h5>
                <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
            </div>
        </Link>
    );
}
