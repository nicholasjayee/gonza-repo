"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ProductsTable } from "./components/ProductsTable";
import { Product } from "../../../types";
import { Plus, Search, Scan, Package, AlertCircle, Zap, Trash2 } from "lucide-react";
import { getProductsAction, deleteProductAction } from "../../../api/controller";
import { useMessage } from "@/shared/ui/Message";
import { useRouter } from "next/navigation";
import { HardwareManager } from "@/products/hardware/ui/HardwareManager";
import { useScanner } from "@/products/hardware/utils/useScanner";
import { CategoryManagement } from "../category/CategoryManagementPage";
import { SupplierManagement } from "../supplier/SupplierManagementPage";
import { ProductFilters } from "./components/ProductFilters";
import { ExportDataView } from "./components/ExportDataView";
import { BulkUploadView } from "./components/BulkUploadView";
import { BulkUpdateView } from "./components/BulkUpdateView";
import { getCategoriesAction, getSuppliersAction } from "@/products/api/controller";
import { Category, Supplier } from "../../../types";

export const ProductsListPage: React.FC = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'suppliers' | 'bulk-upload' | 'bulk-update' | 'export'>('products');
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 0,
        minStock: 0,
        maxStock: 0,
        startDate: '',
        endDate: '',
        datePreset: '',
        categoryId: '',
        supplierId: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { showMessage, MessageComponent } = useMessage();

    const handleToggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = (ids: string[]) => {
        setSelectedIds(ids);
    };

    const handleBulkDeleteSelected = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

        try {
            const { deleteBulkProductsAction } = await import("../../../api/controller");
            setLoading(true);
            const res = await deleteBulkProductsAction(selectedIds);
            if (res.success) {
                showMessage('success', `${selectedIds.length} products deleted`);
                setSelectedIds([]);
                fetchProducts();
            } else {
                showMessage('error', res.error || 'Failed to delete products');
                setLoading(false);
            }
        } catch (e) {
            showMessage('error', 'An unexpected error occurred');
            setLoading(false);
        }
    };

    // Scanner Debugging States
    const [mounted, setMounted] = useState(false);
    const [lastChar, setLastChar] = useState<string | null>(null);
    const [isScannerActive, setIsScannerActive] = useState(false);

    // Refs to store data without triggering re-renders or dependencies
    const productsRef = useRef<Product[]>([]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProductsAction();
            if (res.success) {
                const data = res.data as unknown as Product[];
                setProducts(data);
                productsRef.current = data;
            } else {
                throw new Error(res.error);
            }
        } catch (err) {
            setError("Unable to load the product catalog. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // 1. Initial Data Fetch & Mount Check
    useEffect(() => {
        setMounted(true);
        fetchProducts();

        getCategoriesAction().then(res => {
            if (res.success) setCategories(res.data);
        });
        getSuppliersAction().then(res => {
            if (res.success) setSuppliers(res.data);
        });
    }, []);

    // 2. Scan Processor (Memoized to prevent being a dependency)
    const processScan = useCallback((code: string) => {
        console.log("🎯 SCAN SUCCESS:", code);
        showMessage('info', `Scanning: ${code}...`);

        // Use the ref to check against latest products
        const existing = productsRef.current.find(p => p.barcode === code || p.sku === code);
        if (existing) {
            console.log("Found existing:", existing.name);
            showMessage('success', `Found: ${existing.name}`);

            // Prefill date filters with the product's creation date
            const itemDate = new Date(existing.createdAt).toISOString().split('T')[0];
            setFilters(prev => ({
                ...prev,
                startDate: itemDate,
                endDate: itemDate,
                datePreset: 'specific'
            }));

            setSearchQuery(code);
            setActiveTab('products');
            setShowFilters(true);
        } else {
            console.log("New item, redirecting...");
            showMessage('info', `New Item Detected. Redirecting...`);
            router.push(`/products/create?barcode=${code}`);
        }
    }, [router, showMessage]);

    // 3. Scanner Integration
    useScanner({
        onScan: (code: string) => {
            processScan(code);
            setLastChar(code.slice(-1)); // Brief feedback
            setTimeout(() => setLastChar(null), 500);
        },
        enabled: mounted
    });

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteProductAction(id);
            if (res.success) {
                showMessage('success', 'Product deleted successfully');
                const nextProducts = products.filter(p => p.id !== id);
                setProducts(nextProducts);
                productsRef.current = nextProducts; // Sync ref
            } else {
                showMessage('error', res.error || 'Failed to delete product');
            }
        } catch (err) {
            showMessage('error', 'An unexpected error occurred');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode?.includes(searchQuery) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

        const price = p.sellingPrice;
        const matchesPrice = (filters.minPrice === 0 || price >= filters.minPrice) &&
            (filters.maxPrice === 0 || price <= filters.maxPrice);

        const stock = p.stock;
        const matchesStock = (filters.minStock === 0 || stock >= filters.minStock) &&
            (filters.maxStock === 0 || stock <= filters.maxStock);

        const matchesCategory = !filters.categoryId || p.categoryId === filters.categoryId;
        const matchesSupplier = !filters.supplierId || p.supplierId === filters.supplierId;

        const date = new Date(p.createdAt);
        const matchesStart = !filters.startDate || date >= new Date(filters.startDate);

        let matchesEnd = true;
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            matchesEnd = date <= end;
        }

        return matchesSearch && matchesPrice && matchesStock && matchesCategory && matchesSupplier && matchesStart && matchesEnd;
    });

    const clearFilters = () => {
        setFilters({
            minPrice: 0,
            maxPrice: 0,
            minStock: 0,
            maxStock: 0,
            startDate: '',
            endDate: '',
            datePreset: '',
            categoryId: '',
            supplierId: ''
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {MessageComponent}


            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 flex-1">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-primary">
                            <Package className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-[0.15em]">Smart Inventory</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">Inventory Center</h1>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Manage your products, categories, and suppliers in one place.
                        </p>
                    </div>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDeleteSelected}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all animate-in fade-in slide-in-from-right-2"
                        >
                            <Trash2 className="h-5 w-5" />
                            <span>Delete ({selectedIds.length})</span>
                        </button>
                    )}

                    <Link
                        href="/products/create"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>New Product</span>
                    </Link>
                </div>

                <div className="w-full lg:w-80">
                    <HardwareManager />
                </div>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-2xl w-fit border border-border overflow-x-auto max-w-full">
                {[
                    { id: 'products', label: 'All Products', icon: <Package className="w-4 h-4" /> },
                    { id: 'categories', label: 'Categories', icon: <Plus className="w-4 h-4" /> },
                    { id: 'suppliers', label: 'Suppliers', icon: <Plus className="w-4 h-4" /> },
                    { id: 'bulk-upload', label: 'Bulk Upload', icon: <Zap className="w-4 h-4" /> },
                    { id: 'bulk-update', label: 'Bulk Update', icon: <Zap className="w-4 h-4" /> },
                    { id: 'export', label: 'Export', icon: <Zap className="w-4 h-4" /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'products' && (
                <>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-2 bg-muted/30 border border-border rounded-2xl shadow-inner-sm">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, barcode, or SKU..."
                                className="w-full h-12 pl-11 pr-4 bg-transparent outline-none text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-[10px] font-bold text-primary shadow-sm">
                                <Zap className="h-3 w-3 fill-current" />
                                <span>SCAN READY</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border hover:bg-muted'}`}
                        >
                            <Search className="w-4 h-4" />
                            Filters
                            {(filters.minPrice > 0 || filters.maxPrice > 0 || filters.categoryId || filters.supplierId) && (
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2 border-l border-border hidden sm:flex">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Items</span>
                                <span className="text-lg font-black leading-none">{products.length}</span>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="animate-in slide-in-from-top-4 duration-300">
                            <ProductFilters
                                filters={filters}
                                onChange={setFilters}
                                categories={categories}
                                suppliers={suppliers}
                                onClear={clearFilters}
                            />
                        </div>
                    )}

                    {loading ? (
                        <div className="grid place-items-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading amazing products...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
                            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
                            <p className="text-sm text-muted-foreground mb-6">{error}</p>
                            <button
                                onClick={() => fetchProducts()}
                                className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Retry Fetch
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-5 duration-700">
                            <ProductsTable
                                products={filteredProducts}
                                onDelete={handleDelete}
                                selectedIds={selectedIds}
                                onToggleSelect={handleToggleSelect}
                                onSelectAll={handleSelectAll}
                            />
                        </div>
                    )}
                </>
            )}

            {activeTab === 'categories' && <CategoryManagement />}
            {activeTab === 'suppliers' && <SupplierManagement />}
            {activeTab === 'bulk-upload' && <BulkUploadView products={products} onComplete={() => { setActiveTab('products'); fetchProducts(); }} />}
            {activeTab === 'bulk-update' && <BulkUpdateView products={products} onComplete={() => fetchProducts()} />}
            {activeTab === 'export' && <ExportDataView products={filteredProducts} />}
        </div>
    );
};
