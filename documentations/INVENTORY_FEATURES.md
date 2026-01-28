# Inventory Module - Feature Documentation

This document summarizes the core features and technical implementations for the **Inventory** module within the Client application.

---

## 1. Stock Movement & Logistics
The Inventory module handles bulk stock operations and internal logistics that go beyond simple sales.

*   **Batch Restocking**: 
    *   Efficiently update stock levels for multiple products simultaneously.
    *   Direct linking to **Suppliers** for procurement traceability.
*   **Audit-Ready History**: 
    *   Automated logging of every "Movement" via the `ProductHistoryService`.
    *   Captures the user, quantity change, old vs. new stock, and the specific procurement reference.
*   **Atomic Transactions**: Multi-product restocking is handled within a single database transaction to prevent inventory mismatches.

---

## 2. Future Capabilities
The module serves as the foundation for upcoming logistics features:
*   **Stock Transfers**: Moving inventory between Main and Sub branches.
*   **Requisitions**: Formal requests for stock from different departments.

---

## 3. Technical Architecture
| Component | Responsibility |
| :--- | :--- |
| **Inventory Service** | `inventory/api/service.ts`: Handles bulk stock adjustments and procurement logic. |
| **History Integration** | Tight coupling with `ProductHistoryService` for immutable auditing. |
