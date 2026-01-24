# Customers Module - Feature Documentation

This document summarizes the core features and technical implementations for the **Customers** module within the Client application.

---

## 1. Customer Relationship Management
The module acts as a central repository for all client interactions and profile management.

*   **Unified Profiles**: Comprehensive storage of customer names, phone numbers, and addresses.
*   **Search & Discovery**:
    *   **Phone Lookup**: Real-time search for customers by phone number (used extensively in the sales flow).
    *   **Name Search**: Case-insensitive name searching for quick retrieval.
*   **Branch-Level Isolation**: Customers are linked to specific administrative accounts and optionally to branches, ensuring data privacy and organization.

---

## 2. Technical Architecture
The module follows a clean, decoupled service architecture.

| Layer | Responsibility |
| :--- | :--- |
| **Service Layer** | `client/src/customers/api/service.ts`: Handles Prisma-based search optimization and CRUD logic. |
| **API Controller** | `client/src/customers/api/controller.ts`: Bridge between the UI and service layer, handling request context and admin attribution. |

---

## 3. Integrated Workflows
*   **Sales Integration**: Customers are seamlessly linked to sales records, allowing for historical transaction tracking (e.g., viewing all sales for a specific customer).
*   **Messaging Support**: Provides the foundational contact data for SMS and WhatsApp marketing campaigns via the Messaging module.
