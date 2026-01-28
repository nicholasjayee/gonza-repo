"use client";

import React, { useState, useEffect } from 'react';
import { getSales, getProducts } from '@/dashboard/api/actions';
import { getSubBranchesAction } from '@/dashboard/api/controller';
import AnalyticsDashboard from '@/dashboard/ui/components/AnalyticsDashboard';
import QuickActionButtons from '@/dashboard/ui/components/QuickActionButtons';
import UpdateNotificationButton from '@/dashboard/ui/components/UpdateNotificationButton';
import { BranchFilter } from '@/shared/components/BranchFilter';
import { Loader2, Building2, LayoutDashboard } from 'lucide-react';
import { Sale, Product } from '@/dashboard/types';

interface Branch {
    id: string;
    name: string;
}

interface DashboardPageProps {
    branchType: 'MAIN' | 'SUB';
}

export default function DashboardPage({ branchType }: DashboardPageProps) {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Mock update state for now
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuickCreate = (type: 'Paid' | 'NOT PAID' | 'Quote' | 'Installment Sale') => {
        console.log(`Quick create: ${type}`);
        // TODO: Implement navigation or modal opening based on type
    };

    const handleUpdate = () => {
        setIsUpdating(true);
        setTimeout(() => {
            setIsUpdating(false);
            setUpdateAvailable(false);
        }, 2000);
    };

    const loadBranches = React.useCallback(async () => {
        try {
            const branchesRes = await getSubBranchesAction();
            if (branchesRes.success && branchesRes.data) {
                setBranches(branchesRes.data as Branch[]);
            }
        } catch (error) {
            console.error("Failed to load branches:", error);
        }
    }, []);

    const loadData = React.useCallback(async () => {
        setIsRefreshing(true);
        if (sales.length === 0) setIsLoading(true);

        try {
            const [salesData, productsData] = await Promise.all([
                getSales(undefined, undefined, selectedBranchId || undefined),
                getProducts(selectedBranchId || undefined)
            ]);

            setSales(salesData);
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [sales.length, selectedBranchId]);

    useEffect(() => {
        if (branchType === 'MAIN') {
            loadBranches();
        }
        loadData();
    }, [branchType, loadBranches, loadData]);

    useEffect(() => {
        // Refresh data when branch filter changes (only for MAIN)
        if (branchType === 'MAIN' && (branches.length > 0 || selectedBranchId !== null)) {
            loadData();
        }
    }, [selectedBranchId, branchType, branches.length, loadData]);

    if (isLoading && sales.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            {branchType === 'MAIN' ? <Building2 className="w-5 h-5 text-primary" /> : <LayoutDashboard className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black italic tracking-tight">
                                {branchType === 'MAIN' ? 'Branch Overview' : 'Dashboard'}
                            </h1>
                            {isRefreshing && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        {branchType === 'MAIN'
                            ? (!selectedBranchId ? 'Company-wide metrics across all branches' : 'Filtered branch performance')
                            : 'Your branch performance overview'}
                    </p>
                </div>

                {branchType === 'MAIN' && branches.length > 0 && (
                    <div className="bg-card border border-border p-3 rounded-2xl shadow-sm">
                        <BranchFilter
                            branches={branches}
                            selectedBranchId={selectedBranchId}
                            onBranchChange={setSelectedBranchId}
                        />
                    </div>
                )}
            </div>

            {/* Update Notification */}
            {updateAvailable && (
                <UpdateNotificationButton 
                    onUpdate={handleUpdate}
                    isUpdating={isUpdating}
                />
            )}

            {/* Quick Actions */}
            <QuickActionButtons onQuickCreate={handleQuickCreate} />

            <AnalyticsDashboard 
                sales={sales} 
                products={products}
                currency="UGX"
                branchId={selectedBranchId || undefined}
            />
        </div>
    );
}
