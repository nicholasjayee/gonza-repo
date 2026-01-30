import React from "react";
import { Badge } from "@/inventory/components/ui/badge";
import { Product } from "@/inventory/types/";

interface StockStatusBadgeProps {
  product: Product;
}

const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ product }) => {
  if (product.quantity === 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }

  if (product.quantity <= product.minimumStock) {
    return <Badge variant="warning">Low stock</Badge>;
  }

  return <Badge variant="success">In stock</Badge>;
};

export default StockStatusBadge;
