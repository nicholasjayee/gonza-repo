"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Loader2, Eye, Pencil, Printer, Package } from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Product } from "@/products/types";
import { printBarcode } from "@/products/hardware/utils/print";
import { useSettings } from "@/settings/api/SettingsContext";

interface ProductsTableProps {
  products: Product[];
  onDelete?: (id: string) => Promise<void>;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onDelete,
  selectedIds = [],
  onToggleSelect,
  onSelectAll
}) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const { currency } = useSettings();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

  const handleDelete = async () => {
    if (onDelete && productToDelete) {
      setDeletingId(productToDelete.id);
      setConfirmOpen(false);
      try {
        await onDelete(productToDelete.id);
      } finally {
        setDeletingId(null);
        setProductToDelete(null);
      }
    }
  };

  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {onToggleSelect && (
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={(e) => {
                      if (onSelectAll) {
                        onSelectAll(e.target.checked ? products.map(p => p.id) : []);
                      }
                    }}
                  />
                </th>
              )}
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Internal Codes</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Selling Price</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={onToggleSelect ? 7 : 6} className="px-6 py-12 text-center text-muted-foreground italic">
                  No products found. Start by adding one!
                </td>
              </tr>
            ) : products.map((product) => (
              <tr
                key={product.id}
                className={`hover:bg-muted/20 transition-colors group ${selectedIds.includes(product.id) ? 'bg-primary/5' : ''}`}
              >
                {onToggleSelect && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => onToggleSelect(product.id)}
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground/30">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">{product.name}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{product.description || "No description"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono border border-border/50">BC: {product.barcode || "N/A"}</span>
                    </div>
                    {product.sku && <span className="text-[9px] text-muted-foreground/70 pl-0.5">SKU: {product.sku}</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${product.stock <= (product.minStock || 5)
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}>
                      {product.stock} units
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 font-bold px-1">Min Level: {product.minStock || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-sm">{currency} {product.sellingPrice.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 bg-primary/5 text-primary rounded-md font-medium border border-primary/10">
                    {product.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => printBarcode({ ...product, price: product.sellingPrice })}
                      className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                      title="Print Label"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/products/show?id=${product.id}`}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                      title="View Product"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/products/edit?id=${product.id}`}
                      className="p-1.5 text-foreground/70 hover:bg-muted rounded-lg transition-colors border border-border"
                      title="Edit Product"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => openDeleteConfirm(product)}
                        disabled={deletingId === product.id}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20 disabled:opacity-50"
                        title="Delete Product"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone and will remove the product from the inventory catalog.`}
        confirmText="Delete Product"
        cancelText="Keep Product"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        isLoading={!!deletingId}
      />
    </div>
  );
};

