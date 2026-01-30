"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/inventory/components/ui/button";
import {
  Plus,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useBusiness } from "@/inventory/contexts/BusinessContext";
import InventoryTable, {
  SortField,
} from "@/inventory/components/inventory/InventoryTable";
import InventoryFilters from "@/inventory/components/inventory/InventoryFilters";
import InventoryStats from "@/inventory/components/inventory/InventoryStats";
import { useProducts } from "@/inventory/hooks/useProducts";
import { useCategories } from "@/inventory/hooks/useCategories";
import { useIsMobile } from "@/inventory/hooks/use-mobile";
import InventoryPageSkeleton from "@/inventory/components/inventory/InventoryPageSkeleton";
import BulkDeleteDialog from "@/inventory/components/inventory/BulkDeleteDialog";
import CSVUploadDialog from "@/inventory/components/inventory/CSVUploadDialog";
import CSVUpdateDialog from "@/inventory/components/inventory/CSVUpdateDialog";
import { useBulkProducts } from "@/inventory/hooks/useBulkProducts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/inventory/components/ui/dropdown-menu";

// Import Utilities
import { exportProductsForUpdate } from "@/inventory/utils/exportProductsForUpdate";
import { exportProductsToCSV } from "@/inventory/utils/exportProductsToCSV";
import { exportProductsToPDF } from "@/inventory/utils/exportProductsToPDF";
import { generateProductCSVTemplate } from "@/inventory/utils/csvTemplate";
import { useToast } from "@/inventory/hooks/use-toast";

const Products = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMobile = useIsMobile();

  // Dialog States
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [csvUpdateOpen, setCsvUpdateOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Products Hook
  const {
    products,
    isLoading,
    totalCount,
    loadProducts,
    refetch,
    filters,
    setFilters,
    filteredProducts,
    page,
    setPage,
    pageSize,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPageSize,
  } = useProducts(50);

  // Categories Hook
  const { categories, loadCategories } = useCategories();

  // Bulk Actions Hook
  const {
    selectedProductIds,
    toggleProductSelection,
    toggleAllProducts,
    bulkDeleteProducts,
    bulkCreateProducts,
    clearSelection,
  } = useBulkProducts();

  // Local Sorting State
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initial Load
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    await bulkDeleteProducts(selectedProductIds);
    setBulkDeleteOpen(false);
    clearSelection();
    await loadProducts();
    toast({
      title: "Products deleted",
      description: "Selected products have been successfully deleted.",
    });
  };

  // CSV Upload Handler
  const handleCSVUpload = async (productsToCreate: any[]) => {
    try {
      await bulkCreateProducts(productsToCreate);
      setCsvUploadOpen(false);
      await loadProducts();
      toast({
        title: "Products imported",
        description: "Products have been successfully imported from CSV.",
      });
    } catch (error) {
       console.error(error);
      toast({
        title: "Import failed",
        description: "Failed to import products. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    exportProductsToCSV(products); // Note: exports currently loaded products
  };

  const handleExportPDF = () => {
    if (currentBusiness) {
      exportProductsToPDF(products, {
        businessName: currentBusiness.name || "Business",
        businessAddress: currentBusiness.location || "",
        businessPhone: currentBusiness.phone || "",
        businessEmail: currentBusiness.email || "",
        currency: currentBusiness.settings?.currency || "UGX",
      });
    }
  };

  const handleExportForUpdate = () => {
    exportProductsForUpdate(products);
  };

  const handleDownloadTemplate = () => {
    generateProductCSVTemplate();
    toast({
      title: "Template downloaded",
      description: "CSV template has been downloaded.",
    });
  };

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Refreshed",
      description: "Product list refreshed.",
    });
  };

  // Helper for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (isLoading && products.length === 0) {
    return <InventoryPageSkeleton />;
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory")}
            className="shrink-0 h-8 w-8"
            title="Back to inventory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-sales-dark">
              Products ({totalCount})
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            disabled={isLoading}
            className="h-9 w-9"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-9">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCSV}>
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportForUpdate}>
                Export for Bulk Update
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-9">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Import Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCsvUploadOpen(true)}>
                Import New Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCsvUpdateOpen(true)}>
                Bulk Update Products
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadTemplate}>
                Download Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => router.push("/inventory/new-product")}
            className="gap-2 h-9"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Product</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStats
        products={products}
        totalCountOverride={totalCount}
      />

      {/* Filters */}
      <InventoryFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        productsCount={totalCount}
      />

      {/* Bulk Action Bar */}
      {selectedProductIds.size > 0 && (
        <div className="bg-muted/50 p-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium px-2">
            {selectedProductIds.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <InventoryTable
          products={filteredProducts}
          isLoading={isLoading}
          enableBulkActions={true}
          selectedProductIds={selectedProductIds}
          onToggleProductSelection={toggleProductSelection}
          onToggleAllProducts={toggleAllProducts}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          categories={categories.map((c) => c.name)}
          onUpdateProduct={async () => Promise.resolve(true)}
        />
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="flex items-center text-sm font-medium">
          Page {page}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={filteredProducts.length < pageSize || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Dialogs */}
      <CSVUploadDialog
        open={csvUploadOpen}
        onOpenChange={setCsvUploadOpen}
        onUpload={handleCSVUpload}
        categories={categories.map((c) => c.name)}
      />

      <CSVUpdateDialog
        open={csvUpdateOpen}
        onOpenChange={setCsvUpdateOpen}
        userId={user?.id}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selectedProductIds.size}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
};

export default Products;
