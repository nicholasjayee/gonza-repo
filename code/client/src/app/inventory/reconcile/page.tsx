"use client";

import React, { useState } from "react";
import { useProducts } from "@/inventory/hooks/useProducts";

import StockReconciliation from "@/inventory/components/inventory/StockReconciliation";
import { Product } from "@/inventory/types/";
import { Button } from "@/inventory/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/inventory/components/ui/card";
import { Input } from "@/inventory/components/ui/input";
import { Search, ArrowLeft, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReconcilePage() {
  const router = useRouter();
  const { products, isLoading, filters, setFilters, refetch } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Scale className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Stock Reconciliation
            </h1>
            <p className="text-muted-foreground">
              Review and correct stock discrepancies
            </p>
          </div>
        </div>
      </div>

      {selectedProduct ? (
        <StockReconciliation
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReconciled={() => {
            refetch();
            setSelectedProduct(null);
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Select a Product</CardTitle>
            <CardDescription>
              Search and select a product to reconcile its stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            <div className="rounded-md border">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="divide-y">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground flex gap-3">
                          <span>SKU: {product.itemNumber}</span>
                          <span>Stock: {product.quantity}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Reconcile
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
