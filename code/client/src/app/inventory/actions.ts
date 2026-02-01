/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { ProductFilters } from "@/types";
import { NextRequest } from "next/server";
import { Prisma } from "@gonza/shared/prisma/db";

async function getAuth() {
  const headerList = await headers();
  const cookieStore = await cookies();

  const mockReq = {
    headers: headerList,
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  } as unknown as NextRequest;

  return authGuard(mockReq, ["user", "admin"]);
}

export async function getCurrentUserAction() {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };
  return { success: true, user: auth.user };
}

export async function getAllProductIdentifiersAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const products = await db.product.findMany({
      where: { branchId },
      select: { id: true, name: true },
    });

    return { success: true, data: products };
  } catch (error: unknown) {
    console.error("Error fetching product identifiers:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return { success: false, error: message };
  }
}

export async function getInventoryProductsAction(
  filters: ProductFilters,
  page: number = 1,
  pageSize: number = 50,
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const where: Prisma.ProductWhereInput = {
      branchId: branchId,
      // user: { id: auth.user.id } // Optional: strict user check if needed, but branchId should suffice for tenancy
    };

    // Search filter
    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { supplier: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = { name: filters.category };
    }

    // Stock status filter
    if (filters.stockStatus === "outOfStock") {
      where.stock = 0;
    } else if (filters.stockStatus === "lowStock") {
      // Prisma doesn't support direct column comparison in where clause easily without raw query
      // We'll filter client side for low stock or use a raw query if performance is critical
      // For now, let's fetch all > 0 and filter in memory if lowStock is requested,
      // OR we can just fetch all and let the client filter if the dataset isn't huge.
      // But to be safe, let's just return all non-zero stock for 'inStock' and 'lowStock'
      // and let the client refine 'lowStock'
      where.stock = { gt: 0 };
    } else if (filters.stockStatus === "inStock") {
      where.stock = { gt: 0 };
    }

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    // Map to frontend type
    const mappedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      category: p.category?.name || "Uncategorized",
      quantity: p.stock,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
      image: p.image,
      supplier: p.supplier?.name,
      itemNumber: p.sku || "", // Mapping sku to itemNumber as per frontend type expectation
      barcode: p.barcode,
      minimumStock: p.minStock,
      locationId: p.branchId,
      userId: p.userId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    // Refine lowStock filter if needed (since we only filtered > 0 in DB)
    let finalProducts = mappedProducts;
    if (filters.stockStatus === "lowStock") {
      finalProducts = mappedProducts.filter(
        (p) => p.quantity <= p.minimumStock,
      );
    }

    return {
      success: true,
      data: {
        products: serialize(finalProducts),
        count: totalCount,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching inventory products:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return { success: false, error: message };
  }
}

export async function getInventoryStatsAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const products = await db.product.findMany({
      where: { branchId },
      select: {
        stock: true,
        costPrice: true,
        sellingPrice: true,
        minStock: true,
      },
    });

    let totalCostValue = 0;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalCostValue += p.stock * p.costPrice;
      totalStockValue += p.stock * p.sellingPrice;
      if (p.stock === 0) {
        outOfStockCount++;
      } else if (p.stock <= p.minStock) {
        lowStockCount++;
      }
    });

    return {
      success: true,
      data: {
        totalCostValue,
        totalStockValue,
        lowStockCount,
        outOfStockCount,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching inventory stats:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch stats";
    return { success: false, error: message };
  }
}

export async function getInventorySalesAction(
  page: number = 1,
  pageSize: number = 50,
  sortOrder: "asc" | "desc" = "desc",
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const [sales, totalCount] = await Promise.all([
      db.sale.findMany({
        where: { branchId },
        include: {
          items: true,
          // customer: true // If needed
        },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.sale.count({ where: { branchId } }),
    ]);

    // Map to frontend Sale type
    // Note: The frontend Sale type expects specific fields.
    // We need to ensure the mapping is correct based on what useSalesData expects.
    // The existing mapDbSaleToSale might need adjustment or we map manually here.

    const mappedSales = sales.map((s) => ({
      id: s.id,
      user_id: s.userId,
      location_id: s.branchId,
      receipt_number: s.saleNumber, // Mapping saleNumber to receipt_number
      customer_name: s.customerName,
      customer_address: s.customerAddress,
      customer_contact: s.customerPhone,
      customer_id: s.customerId,
      items: s.items.map((i) => ({
        id: i.id,
        name: i.productName,
        quantity: i.quantity,
        price: Number(i.sellingPrice),
        cost: Number(i.unitCost),
        discount: Number(i.discount),
        // Add other item fields if necessary
      })),
      payment_status: s.paymentStatus,
      // profit: s.profit, // Profit is not directly on Sale model, might need calculation
      date: s.date,
      tax_rate: Number(s.taxRate),
      created_at: s.createdAt,
      updated_at: s.updatedAt,
      amount_paid: Number(s.amountPaid),
      amount_due: Number(s.total) - Number(s.amountPaid), // Calculate due
      // category_id: s.categoryId // Not on Sale model
    }));

    return {
      success: true,
      data: {
        sales: serialize(mappedSales),
        count: totalCount,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching inventory sales:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch sales";
    return { success: false, error: message };
  }
}

export async function getScavengedProductNamesAction(
  missingProductIds: string[],
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const names: Record<string, string> = {};

    const saleItems = await db.saleItem.findMany({
      where: {
        productId: { in: missingProductIds },
      },
      select: {
        productId: true,
        productName: true,
      },
      distinct: ["productId"],
    });

    saleItems.forEach((item) => {
      if (item.productId && item.productName) {
        names[item.productId] = item.productName;
      }
    });

    return { success: true, data: names };
  } catch (error: unknown) {
    console.error("Error scavenging product names:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to scavenge names",
    };
  }
}

export async function updateStockHistoryGroupDateAction(
  entryIds: string[],
  newDate: Date,
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    await db.productHistory.updateMany({
      where: {
        id: { in: entryIds },
      },
      data: {
        createdAt: newDate,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating stock history date:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update date",
    };
  }
}

export async function calculateStockReconciliationAction(productId: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const firstEntry = await db.productHistory.findFirst({
      where: {
        productId,
        product: { branchId },
      },
      orderBy: { createdAt: "asc" },
    });

    const [sales, stockHistory] = await Promise.all([
      db.saleItem.findMany({
        where: {
          productId,
          sale: { branchId },
        },
        include: { sale: true },
      }),
      db.productHistory.findMany({
        where: {
          productId,
          product: { branchId },
        },
      }),
    ]);

    const dailyTransactions = new Map<
      string,
      {
        itemsSold: number;
        stockAdded: number;
        transferOut: number;
        returnIn: number;
        returnOut: number;
      }
    >();

    sales.forEach((item) => {
      if (!item.sale) return;
      const date = item.sale.createdAt.toISOString().split("T")[0];
      const existing = dailyTransactions.get(date) || {
        itemsSold: 0,
        stockAdded: 0,
        transferOut: 0,
        returnIn: 0,
        returnOut: 0,
      };
      existing.itemsSold += item.quantity;
      dailyTransactions.set(date, existing);
    });

    stockHistory.forEach((entry) => {
      const date = entry.createdAt.toISOString().split("T")[0];
      const existing = dailyTransactions.get(date) || {
        itemsSold: 0,
        stockAdded: 0,
        transferOut: 0,
        returnIn: 0,
        returnOut: 0,
      };

      const reason = (entry.reason || "").toLowerCase();
      const delta = (entry.newStock || 0) - (entry.oldStock || 0);

      if (
        reason.includes("purchase") ||
        reason.includes("invoice") ||
        reason.includes("supplier") ||
        reason.includes("session")
      ) {
        if (delta > 0) existing.stockAdded += delta;
      } else if (reason === "transfer out") {
        if (delta < 0) existing.transferOut += Math.abs(delta);
      } else if (reason === "customer return" || reason === "return in") {
        if (delta > 0) existing.returnIn += delta;
      } else if (reason === "return to supplier" || reason === "return out") {
        if (delta < 0) existing.returnOut += Math.abs(delta);
      } else {
        if (delta > 0 && !existing.stockAdded && !existing.returnIn) {
          existing.stockAdded += delta;
        }
      }

      dailyTransactions.set(date, existing);
    });

    const sortedDates = Array.from(dailyTransactions.keys()).sort();
    const dailyBreakdown: {
      date: string;
      startingStock: number;
      itemsSold: number;
      stockAdded: number;
      stockIn: number;
      transferOut: number;
      returnIn: number;
      returnOut: number;
      endingStock: number;
    }[] = [];
    let runningStock = firstEntry?.newStock || 0;

    sortedDates.forEach((date) => {
      const day = dailyTransactions.get(date)!;
      const startingStock = runningStock;
      const endingStock =
        startingStock -
        day.itemsSold +
        day.stockAdded -
        day.transferOut +
        day.returnIn -
        day.returnOut;

      dailyBreakdown.push({
        date,
        startingStock,
        itemsSold: day.itemsSold,
        stockAdded: day.stockAdded,
        stockIn: 0,
        transferOut: day.transferOut,
        returnIn: day.returnIn,
        returnOut: day.returnOut,
        endingStock,
      });
      runningStock = endingStock;
    });

    const calculatedClosingStock = runningStock;

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    const currentStock = product?.stock || 0;
    const discrepancy = currentStock - calculatedClosingStock;

    const totals = dailyBreakdown.reduce(
      (acc, day) => ({
        itemsSold: acc.itemsSold + day.itemsSold,
        stockAdded: acc.stockAdded + day.stockAdded,
        transferOut: acc.transferOut + day.transferOut,
        returnIn: acc.returnIn + day.returnIn,
        returnOut: acc.returnOut + day.returnOut,
      }),
      {
        itemsSold: 0,
        stockAdded: 0,
        transferOut: 0,
        returnIn: 0,
        returnOut: 0,
      },
    );

    return {
      success: true,
      data: {
        currentStock,
        openingStock: firstEntry?.newStock || 0,
        itemsSold: totals.itemsSold,
        stockAdded: totals.stockAdded,
        stockIn: 0,
        transferOut: totals.transferOut,
        returnIn: totals.returnIn,
        returnOut: totals.returnOut,
        calculatedClosingStock,
        discrepancy,
        dailyBreakdown,
      },
    };
  } catch (error: unknown) {
    console.error("Error calculating reconciliation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate",
    };
  }
}

export async function applyStockCorrectionAction(
  productId: string,
  quantity: number,
  costPrice: number,
  sellingPrice: number,
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    const oldQuantity = product.stock;

    await db.product.update({
      where: { id: productId },
      data: {
        stock: quantity,
        costPrice,
        sellingPrice,
      },
    });

    await db.productHistory.create({
      data: {
        productId,
        // branchId, // Not in ProductHistory
        userId: auth.user.id,
        oldStock: oldQuantity,
        newStock: quantity,
        quantityChange: quantity - oldQuantity,
        type: "ADJUSTMENT",
        reason: "Stock Reconciliation",
        // changeReason: 'Stock Reconciliation' // Not in ProductHistory
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error applying correction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to apply correction",
    };
  }
}

export async function getInventoryExpensesAction(
  startDate?: Date,
  endDate?: Date,
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const where: Prisma.ExpenseWhereInput = {
      branchId: branchId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      data: serialize(expenses),
    };
  } catch (error: unknown) {
    console.error("Error fetching inventory expenses:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch expenses";
    return { success: false, error: message };
  }
}

export async function createProductAction(productData: any) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Handle category
    let categoryId = null;
    if (productData.category) {
      const category = await db.category.upsert({
        where: { name: productData.category },
        update: {},
        create: { name: productData.category },
      });
      categoryId = category.id;
    }

    // Handle supplier
    let supplierId = null;
    if (productData.supplier) {
      const supplier = await db.supplier.upsert({
        where: { name: productData.supplier },
        update: {},
        create: { name: productData.supplier },
      });
      supplierId = supplier.id;
    }

    // Generate SKU if not provided
    let sku = productData.itemNumber;
    if (!sku) {
      const count = await db.product.count({ where: { branchId } });
      sku = `ITEM-${(count + 1).toString().padStart(4, "0")}`;
    }

    const product = await db.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        sellingPrice: productData.sellingPrice || 0,
        costPrice: productData.costPrice || 0,
        stock: productData.quantity || 0,
        initialStock: productData.quantity || 0,
        minStock: productData.minimumStock || 0,
        barcode: productData.barcode,
        sku: sku,
        image: productData.imageUrl,
        categoryId,
        supplierId,
        branchId,
        userId: auth.user.id,
        createdAt: productData.createdAt
          ? new Date(productData.createdAt)
          : new Date(),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // Create stock history if quantity > 0
    if (product.stock > 0) {
      await db.productHistory.create({
        data: {
          productId: product.id,
          userId: auth.user.id,
          oldStock: 0,
          newStock: product.stock,
          quantityChange: product.stock,
          type: "RESTOCK",
          reason: "Initial stock",
        },
      });
    }

    return { success: true, data: serialize(product) };
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

export async function updateProductAction(
  productId: string,
  productData: any,
  changeReason?: string,
  referenceId?: string,
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const currentProduct = await db.product.findUnique({
      where: { id: productId },
    });

    if (!currentProduct) throw new Error("Product not found");

    // Handle category
    let categoryId = undefined;
    if (productData.category !== undefined) {
      if (productData.category) {
        const category = await db.category.upsert({
          where: { name: productData.category },
          update: {},
          create: { name: productData.category },
        });
        categoryId = category.id;
      } else {
        categoryId = null;
      }
    }

    // Handle supplier
    let supplierId = undefined;
    if (productData.supplier !== undefined) {
      if (productData.supplier) {
        const supplier = await db.supplier.upsert({
          where: { name: productData.supplier },
          update: {},
          create: { name: productData.supplier },
        });
        supplierId = supplier.id;
      } else {
        supplierId = null;
      }
    }

    const updateData: any = {};
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined)
      updateData.description = productData.description;
    if (productData.sellingPrice !== undefined)
      updateData.sellingPrice = productData.sellingPrice;
    if (productData.costPrice !== undefined)
      updateData.costPrice = productData.costPrice;
    if (productData.quantity !== undefined)
      updateData.stock = productData.quantity;
    if (productData.minimumStock !== undefined)
      updateData.minStock = productData.minimumStock;
    if (productData.barcode !== undefined)
      updateData.barcode = productData.barcode;
    if (productData.imageUrl !== undefined)
      updateData.image = productData.imageUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (supplierId !== undefined) updateData.supplierId = supplierId;

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        supplier: true,
      },
    });

    // Create stock history if quantity changed
    if (
      productData.quantity !== undefined &&
      productData.quantity !== currentProduct.stock &&
      changeReason !== "skip-history"
    ) {
      await db.productHistory.create({
        data: {
          productId: productId,
          userId: auth.user.id,
          oldStock: currentProduct.stock,
          newStock: productData.quantity,
          quantityChange: productData.quantity - currentProduct.stock,
          type:
            productData.quantity > currentProduct.stock ? "RESTOCK" : "SALE",
          reason:
            changeReason ||
            (productData.quantity > currentProduct.stock
              ? "Manual stock addition"
              : "Manual stock reduction"),
          referenceId: referenceId,
        },
      });
    }

    return { success: true, data: serialize(updatedProduct) };
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function deleteProductAction(productId: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    await db.product.delete({
      where: { id: productId },
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

export async function getCategoriesAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: serialize(categories) };
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getStockHistoryAction(productId?: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const where: Prisma.ProductHistoryWhereInput = {
      product: { branchId },
    };

    if (productId) {
      where.productId = productId;
    }

    const history = await db.productHistory.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedHistory = history.map((h) => ({
      id: h.id,
      productId: h.productId,
      oldQuantity: h.oldStock,
      newQuantity: h.newStock,
      changeReason: h.reason || "Unknown",
      referenceId: h.referenceId,
      createdAt: h.createdAt,
      product: h.product
        ? {
            name: h.product.name,
            costPrice: h.product.costPrice,
            sellingPrice: h.product.sellingPrice,
            itemNumber: h.product.sku || "",
          }
        : undefined,
    }));

    return { success: true, data: serialize(mappedHistory) };
  } catch (error: unknown) {
    console.error("Error fetching stock history:", error);
    return { success: false, error: "Failed to fetch stock history" };
  }
}

export async function updateCategoryAction(id: string, name: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");
    
    try {
        await db.category.update({
            where: { id },
             data: { name }
        });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteCategoryAction(id: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        await db.category.delete({ where: { id } });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createCategoryAction(name: string) {
    const auth = await getAuth();
    if (!auth.authorized) throw new Error("Unauthorized");

    try {
        const category = await db.category.create({
            data: { name }
        });
        return { success: true, data: serialize(category) };
    } catch (e: any) {
         return { success: false, error: e.message };
    }
}

export async function getStockSummaryReportAction(from: Date, to: Date) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const products = await db.product.findMany({
      where: { branchId },
      include: { 
        category: true,
      }
    });

    const reportData = await Promise.all(products.map(async (product) => {
       // 1. Get Opening Stock (stock at 'from' date)
       const lastEntryBeforeStart = await db.productHistory.findFirst({
         where: {
            productId: product.id,
            createdAt: { lt: from }
         },
         orderBy: { createdAt: 'desc' }
       });
       
       let openingStock = 0;
       if (lastEntryBeforeStart) {
         openingStock = lastEntryBeforeStart.newStock;
       } else if (product.createdAt < from) {
         openingStock = 0; // Assume 0 if no history found but product existed
       } else {
         openingStock = 0; // Created after start date
       }

       // 2. Get Transactions within range
       const historyInRange = await db.productHistory.findMany({
         where: {
            productId: product.id,
            createdAt: { gte: from, lte: to }
         }
       });

       let itemsSold = 0;
       let stockIn = 0;
       let transferOut = 0;
       let returnIn = 0;
       let returnOut = 0;

       historyInRange.forEach(entry => {
          const type = entry.type;
          const reason = (entry.reason || "").toLowerCase();
          const change = entry.quantityChange;

          if (type === 'SALE' || reason.includes('sale')) {
             itemsSold += Math.abs(change);
          } else if (type === 'RESTOCK' || reason.includes('purchase') || reason.includes('initial')) {
             stockIn += Math.abs(change);
          } else if (reason.includes('transfer out')) {
             transferOut += Math.abs(change);
          } else if (reason.includes('return in') || reason.includes('customer return')) {
             returnIn += Math.abs(change);
          } else if (reason.includes('return out') || reason.includes('return to supplier')) {
             returnOut += Math.abs(change);
          } else {
             // Fallback
             if (change > 0) stockIn += change;
             else itemsSold += Math.abs(change);
          }
       });

       const closingStock = openingStock + stockIn + returnIn - itemsSold - transferOut - returnOut;
       
       const revaluation = closingStock * product.costPrice;

       return {
          productId: product.id,
          productName: product.name,
          itemNumber: product.sku || "",
          imageUrl: product.image,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          category: product.category?.name,
          openingStock,
          itemsSold,
          stockIn,
          transferOut,
          returnIn,
          returnOut,
          closingStock,
          revaluation
       };
    }));

    return { success: true, data: reportData };
  } catch (error: unknown) {
    console.error("Error fetching stock summary report:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return { success: false, error: message };
  }
}

export async function updateProductsBulkAction(
  updates: Array<{ id: string; updated: any; imageFile?: any }>,
  userId?: string, // Kept for signature compatibility if needed
  changeReason?: string,
  referenceId?: string,
) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    return await db.$transaction(async (tx) => {
      for (const update of updates) {
        const { id, updated } = update;
        
        const currentProduct = await tx.product.findUnique({ where: { id } });
        if (!currentProduct) continue;

        const updateData: any = {};
        if (updated.name !== undefined) updateData.name = updated.name;
        if (updated.description !== undefined) updateData.description = updated.description;
        if (updated.sellingPrice !== undefined) updateData.sellingPrice = updated.sellingPrice;
        if (updated.costPrice !== undefined) updateData.costPrice = updated.costPrice;
        if (updated.quantity !== undefined) updateData.stock = updated.quantity;
        if (updated.minimumStock !== undefined) updateData.minStock = updated.minimumStock;
        if (updated.imageUrl !== undefined) updateData.image = updated.imageUrl;

        await tx.product.update({
          where: { id },
          data: updateData
        });

        if (updated.quantity !== undefined && updated.quantity !== currentProduct.stock && changeReason !== 'skip-history') {
           await tx.productHistory.create({
             data: {
               productId: id,
               userId: auth.user!.id,
               oldStock: currentProduct.stock,
               newStock: updated.quantity,
               quantityChange: updated.quantity - currentProduct.stock,
               type: updated.quantity > currentProduct.stock ? "RESTOCK" : "SALE",
               reason: changeReason || (updated.quantity > currentProduct.stock ? "Manual stock addition" : "Manual stock reduction"),
               referenceId: referenceId
             }
           });
        }
      }
      return { success: true };
    });
  } catch (error: unknown) {
    console.error("Error updating products bulk:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update products" };
  }
}
