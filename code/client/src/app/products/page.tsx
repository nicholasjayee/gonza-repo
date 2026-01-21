import { Metadata } from "next";
import ProductsPage from "@/products/ui/pages/ProductsPage";

export const metadata: Metadata = {
    title: 'Product Catalog | Gonza Client',
    description: 'Organize your product inventory, manage pricing, and track product performance.',
};

export default function Page() {
    return <ProductsPage />;
}
