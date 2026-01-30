import { useState, useMemo } from "react";
import { Product, ProductFilters } from "@/inventory/types/";

export const useProductFilters = (products: Product[]) => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    stockStatus: "all",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm)) ||
          product.category.toLowerCase().includes(searchTerm) ||
          (product.supplier &&
            product.supplier.toLowerCase().includes(searchTerm)) ||
          product.itemNumber.toLowerCase().includes(searchTerm);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Stock status filter
      if (filters.stockStatus !== "all") {
        if (filters.stockStatus === "outOfStock" && product.quantity > 0)
          return false;
        if (filters.stockStatus === "inStock" && product.quantity === 0)
          return false;
        if (
          filters.stockStatus === "lowStock" &&
          (product.quantity === 0 || product.quantity > product.minimumStock)
        )
          return false;
      }

      return true;
    });
  }, [products, filters]);

  return {
    filters,
    setFilters,
    filteredProducts,
  };
};
