# Branches Module - Feature Documentation

This document summarizes the core structural and technical implementations for the **Branches** (Monorepo Infrastructure) module.

---

## 1. Multi-Branch Architecture
Gonza Systems is built on a hierarchical branch model that allows one administrator to manage multiple physical or logical outlets.

*   **Main Branch**: The primary hub of the business. 
    *   **Rule**: Each administrative account is strictly limited to exactly one Main Branch.
*   **Sub-Branches**: Unlimited smaller outlets or departments linked to the Main Branch.
*   **Onboarding Flow**: Integrated guard system that ensures a user has completed branch setup before accessing operational features.

---

## 2. Secure Branch Access
Every branch maintains its own security perimeter.

*   **Access Passwords**: Sub-branches can be protected with unique access passwords.
*   **Bcrypt Hashing**: Passwords are securely hashed before being stored in the database.
*   **Verification Engine**: Integrated multi-portal verification service to ensure users only access branches they are authorized for.

---

## 3. Global Context & Synchronization
*   **Shared Infrastructure**: Branches serve as the primary `where` clause for almost all other modules (Sales, Products, Expenses, Customers).
*   **Branch Switcher**: Global UI component that allows admins to jump between outlets with minimal latency.
*   **Type Persistence**: The system maintains the the current branch "Type" (MAIN/SUB) in the session to dynamically filter available features.

---

## 4. Technical Stack
| Layer | Responsibility |
| :--- | :--- |
| **Branch Service** | `branches/api/service.ts`: Logic for hierarchy enforcement and password security. |
| **Branch Context** | `branches/api/branchContext.ts`: Server-side context provider for managing the active session's branch details. |
