# Sales Module - Feature Documentation

This document summarizes the core features and technical implementations for the **Sales** module within the Client application.

---

## 1. Advanced Transactional Engine
The Sales module handles the complex logic of order processing, stock movement, and financial tracking in a single, atomic workflow.

*   **Flexible Order Types**:
    *   **Direct Sales**: Immediate stock deduction and payment recording.
    *   **Quotes**: Preparation of estimates without affecting stock levels.
    *   **Quote-to-Sale Conversion**: Automated stock deduction and payment update when a quote is finalized.
*   **Smart Financials**:
    *   **Multi-tier Discounts**: Support for both percentage-based and flat-value discounts.
    *   **Tax Calculations**: Automated tax application on net totals.
    *   **Balance Tracking**: Integrated management of partially paid orders and credits.

---

## 2. Inventory & Stock Integrity
The module ensures perfect synchronization between orders and physical stock.

*   **Atomic Transactions**: Uses `db.$transaction` to ensure that a sale is never recorded if stock deduction fails (and vice-versa).
*   **Stock Restoration**: Automated return of items to inventory when a sale is deleted or edited, with full audit logging in the product history.
*   **Identifier Tracking**: Generates professional, sequential sale numbers (e.g., `SAL-2024-001`).

---

## 3. Cash & Wallet Integration
Directly tied to the business's financial hardware (Cash Accounts).

*   **Real-time Balance Updates**: Automatically increments the balance of a linked Cash Account (Cash, Bank, Mobile Money) when a sale is recorded.
*   **Refund Logic**: Decrements cash balances automatically upon sale deletion.

---

## 4. Technical Architecture
| Layer | Responsibility |
| :--- | :--- |
| **Sales Service** | `sales/api/service.ts`: The heaviest service in the app, orchestrating stock, cash, customer, and history logic. |
| **Identifier Service** | Logic to generate unique, branch-aware sale numbers. |
| **Prisma Transaction** | Extensive use of transactional queries to prevent data corruption. |
