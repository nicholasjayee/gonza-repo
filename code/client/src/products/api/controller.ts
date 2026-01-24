'use server';

import { ProductService, CategoryService, SupplierService } from './service';
import { authGuard } from '@gonza/shared/middleware/authGuard';
import { headers, cookies } from 'next/headers';
import { getActiveBranch } from '@/branches/api/branchContext';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@gonza/shared/config/env';

/**
 * Helper to simulate a NextRequest from headers for authGuard
 */
async function getAuth() {
    const headerList = await headers();
    const cookieStore = await cookies();

    const mockReq = {
        headers: headerList,
        cookies: {
            get: (name: string) => cookieStore.get(name)
        }
    } as any;

    return authGuard(mockReq, ['user', 'admin']);
}

/**
 * R2 Upload Helper (Internal)
 */
async function uploadImageToR2(file: File): Promise<string> {
    const s3Client = new S3Client({
        region: 'auto',
        endpoint: env.R2_ENDPOINT,
        credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    }));

    return `${env.R2_PUBLIC_URL}/${fileName}`;
}

// --- Product Actions ---

export async function getProductsAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const { branchId, branchType } = await getActiveBranch();
        const data = await ProductService.getAll(auth.user.id, branchId, branchType);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function getProductAction(identifier: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        let product = await ProductService.getById(identifier);
        if (!product) product = await ProductService.getByBarcode(identifier);
        if (!product) product = await ProductService.getBySlug(identifier);

        return { success: true, data: product };
    } catch (error) {
        console.error("Error fetching product:", error);
        return { success: false, error: "Failed to fetch product" };
    }
}

export async function createProductAction(formData: FormData) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const description = formData.get('description') as string;
        const sellingPrice = Number(formData.get('sellingPrice'));
        const costPrice = Number(formData.get('costPrice'));
        const initialStock = Number(formData.get('initialStock'));
        const minStock = Number(formData.get('minStock'));
        const stock = Number(formData.get('stock'));
        const barcode = formData.get('barcode') as string;
        const sku = formData.get('sku') as string;
        const categoryId = formData.get('categoryId') as string;
        const supplierId = formData.get('supplierId') as string;
        const imageFile = formData.get('image') as File;

        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToR2(imageFile);
        }

        const product = await ProductService.create({
            name,
            slug,
            description,
            sellingPrice,
            costPrice,
            initialStock,
            minStock,
            stock: formData.has('stock') ? Number(formData.get('stock')) : initialStock,
            barcode: barcode || undefined,
            sku: sku || undefined,
            categoryId: categoryId || undefined,
            supplierId: supplierId || undefined,
            image: imageUrl || undefined,
            userId: auth.user.id,
            branchId: (await getActiveBranch()).branchId
        });

        return { success: true, data: product };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message || "Failed to create product" };
    }
}

export async function updateProductAction(id: string, formData: FormData) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const data: any = {};
        const fields = ['name', 'slug', 'description', 'barcode', 'sku', 'categoryId', 'supplierId'];
        fields.forEach(field => {
            const val = formData.get(field);
            if (val !== null) data[field] = val;
        });

        if (formData.has('sellingPrice')) data.sellingPrice = Number(formData.get('sellingPrice'));
        if (formData.has('costPrice')) data.costPrice = Number(formData.get('costPrice'));
        if (formData.has('initialStock')) data.initialStock = Number(formData.get('initialStock'));
        if (formData.has('minStock')) data.minStock = Number(formData.get('minStock'));
        if (formData.has('stock')) data.stock = Number(formData.get('stock'));

        const imageFile = formData.get('image') as File;
        if (imageFile && imageFile.size > 0) {
            data.image = await uploadImageToR2(imageFile);
        }

        const product = await ProductService.update(id, data, auth.user.id);
        return { success: true, data: product };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProductAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        await ProductService.delete(id);
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}

export async function deleteBulkProductsAction(ids: string[]) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        await ProductService.deleteMany(ids);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting multiple products:", error);
        return { success: false, error: error.message || "Failed to delete selected products" };
    }
}

// --- Category Actions ---

export async function getCategoriesAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const data = await CategoryService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function createCategoryAction(data: { name: string; description?: string }) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const category = await CategoryService.create(data);
        return { success: true, data: category };
    } catch (error) {
        return { success: false, error: "Failed to create category" };
    }
}

export async function updateCategoryAction(id: string, data: { name?: string; description?: string }) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const category = await CategoryService.update(id, data);
        return { success: true, data: category };
    } catch (error) {
        return { success: false, error: "Failed to update category" };
    }
}

export async function deleteCategoryAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        await CategoryService.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete category" };
    }
}

// --- Supplier Actions ---

export async function getSuppliersAction() {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const data = await SupplierService.getAll();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "Failed to fetch suppliers" };
    }
}

export async function createSupplierAction(data: any) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const supplier = await SupplierService.create(data);
        return { success: true, data: supplier };
    } catch (error) {
        return { success: false, error: "Failed to create supplier" };
    }
}

export async function updateSupplierAction(id: string, data: any) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const supplier = await SupplierService.update(id, data);
        return { success: true, data: supplier };
    } catch (error) {
        return { success: false, error: "Failed to update supplier" };
    }
}

export async function deleteSupplierAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        await SupplierService.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete supplier" };
    }
}

/**
 * Global Barcode Lookup (Open Food Facts API)
 */
export async function lookupBarcodeAction(barcode: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    if (!barcode || barcode.length < 5) {
        return { success: false, error: "Invalid barcode" };
    }

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        if (!response.ok) throw new Error("External API error");

        const data = await response.json();
        if (data.status === 1 && data.product) {
            const p = data.product;
            return {
                success: true,
                data: {
                    name: p.product_name || p.generic_name || "",
                    description: p.ingredients_text || p.brands || ""
                }
            };
        }
        return { success: false, error: "Product not found in global database" };
    } catch (error) {
        console.error("Error in lookupBarcodeAction:", error);
        return { success: false, error: "Lookup failed. Please enter details manually." };
    }
}

/**
 * Product History
 */
export async function getProductHistoryAction(productId: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    try {
        const { ProductHistoryService } = await import('./historyService');
        const history = await ProductHistoryService.getHistory(productId);

        // Serialize manually if needed, or rely on our serializing data when using it in client components
        // But here we return directly to server component (page), so pure objects are fine 
        // IF the page is server component.
        // However, Date objects need serialization for client components.
        // Let's use serialize utility if we had it imported, or relying on Page to handle it.
        // Actually, we should use serialize util.
        const { serialize } = await import('@/shared/utils/serialize');
        return { success: true, data: serialize(history) };
    } catch (error) {
        console.error("Error fetching product history:", error);
        return { success: false, error: "Failed to fetch product history" };
    }
}
