"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/inventory/components/ui/button";
import ProductForm from "@/inventory/components/inventory/ProductForm";
import { useCategories } from "@/inventory/hooks/useCategories";
import { useProducts } from "@/inventory/hooks/useProducts";
import { ProductFormData } from "@/inventory/types/";
import { toast } from "sonner";
import { useIsMobile } from "@/inventory/hooks/use-mobile";
import { cn } from "@/inventory/lib/utils";

const NewProductPage = () => {
  const router = useRouter();
  const { categories, loadCategories } = useCategories();
  const { createProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  // Load categories on mount
  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createProduct(data);
      if (result) {
        toast.success("Product created successfully");
        router.push("/inventory/products");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("p-4 md:p-6 max-w-4xl mx-auto", isMobile && "p-2")}>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      <ProductForm
        categories={categories}
        onProductSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default NewProductPage;
