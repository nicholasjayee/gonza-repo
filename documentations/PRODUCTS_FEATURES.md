# Products Module - Feature Documentation

This document summarizes the core features and technical implementations for the **Products** module within the Client application.

---

## 1. Comprehensive Inventory Management
The Products module is the engine for catalog management, supporting detailed product lifecycle tracking.

*   **Smart Identification**:
    *   **Auto-SKU Generation**: Generates unique SKUs for internal tracking if not provided.
    *   **Barcode Integration**: Automated generation of secure 10-digit barcodes for scanning readiness.
    *   **Slug Generation**: Provides SEO-friendly URLs for product views.
*   **Organization**:
    *   **Categorization**: Group products into hierarchical categories.
    *   **Supplier Linking**: Direct association with suppliers for restock tracking.
*   **Stock Monitoring**:
    *   **Real-time Levels**: Automated tracking of current stock vs. initial stock.
    *   **Minimum Thresholds**: Configurable alerts for low-stock items.

---

## 2. Automated Product History
The system maintains an immutable audit trail for every product change via the `ProductHistoryService`.

*   **Price Awareness**: Logs whenever a selling price is updated.
*   **Cost Sensitivity**: Tracks fluctuations in cost prices to monitor margin health.
*   **Movement Attribution**: Logs the user responsible for every restock, sale, or manual adjustment.
*   **Transactional Integrity**: Stock movements are tied to specific Sales or Supplier orders for full traceability.

---

## 3. Technical Architecture
| Component | Responsibility |
| :--- | :--- |
| **Product Service** | `products/api/service.ts`: Core logic for CRUD, identifier generation, and history triggers. |
| **History Service** | `products/api/historyService.ts`: Specialized service for logging immutable stock movements. |
| **Image Handler** | R2 integration for secure, performant product images. |

---

## 4. UI/UX Features
*   **Gallery View**: High-performance display of product images managed through Cloudflare R2.
*   **Batch Operations**: Ability to delete or update multiple items simultaneously.
*   **History Logs**: Dedicated UI sections to view the chronological lifecycle of a product.
