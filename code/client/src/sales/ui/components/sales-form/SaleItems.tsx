import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SaleItem } from "@/dashboard/types";
// import ProductSaleItemInput from "@/components/ProductSaleItemInput";

interface SaleItemsProps {
  items: SaleItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, updatedItem: SaleItem) => void;
  onRemoveItem: (index: number) => void;
  saleDate?: string;
}

const SaleItems: React.FC<SaleItemsProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  saleDate,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Items/Services</h3>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          // <ProductSaleItemInput
          //   key={index}
          //   item={item}
          //   index={index}
          //   onUpdate={onUpdateItem}
          //   onRemove={onRemoveItem}
          //   saleDate={saleDate}
          // />
          <div key={index} className="border p-4 rounded-md">
            Item {index + 1} Placeholder
            <Button variant="ghost" size="sm" onClick={() => onRemoveItem(index)}>Remove</Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="gap-1 w-full mt-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>
  );
};

export default SaleItems;
