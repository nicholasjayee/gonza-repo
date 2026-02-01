"use client";

import React, { useState } from "react";
import { Product } from "@/inventory/types/";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/inventory/components/ui/command";
import { Button } from "@/inventory/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/inventory/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/inventory/components/ui/popover";
import { Badge } from "@/inventory/components/ui/badge";
import { useBusinessSettings } from "@/inventory/hooks/useBusinessSettings";
import ProductImage from "./ProductImage";

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string | null;
  onSelect: (product: Product) => void;
  isDisabled?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onSelect,
  isDisabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const { settings } = useBusinessSettings();
  
  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  const handleSelect = (product: Product) => {
    onSelect(product);
    setOpen(false);
  };

  const getStockLabel = (quantity: number) => {
    const formattedQty = parseFloat(quantity.toFixed(5)).toString();
    if (quantity === 0)
      return <Badge variant="destructive">Out of stock</Badge>;
    if (quantity <= 5)
      return (
        <Badge variant="warning" className="bg-amber-500">
          Low: {formattedQty}
        </Badge>
      );
    return <Badge variant="outline">{formattedQty} in stock</Badge>;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={isDisabled}
        >
          {selectedProduct ? (
            <div className="flex items-center">
              <ProductImage
                imageUrl={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                size="sm"
              />
              <span className="ml-2">{selectedProduct.name}</span>
            </div>
          ) : (
            "Select a product..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandEmpty>No products found.</CommandEmpty>
          <CommandGroup heading="Products">
            <CommandList className="max-h-[300px] overflow-auto">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleSelect(product)}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <ProductImage
                      imageUrl={product.imageUrl}
                      alt={product.name}
                      size="sm"
                    />
                    <div className="ml-3">
                      <span
                        className={cn(
                          "mr-2",
                          selectedProductId === product.id
                            ? "font-medium"
                            : "font-normal",
                        )}
                      >
                        {product.name}
                      </span>
                      <div className="text-xs text-gray-500">
                        {settings.currency} {product.sellingPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStockLabel(product.quantity)}
                    {selectedProductId === product.id && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ProductSelector;
