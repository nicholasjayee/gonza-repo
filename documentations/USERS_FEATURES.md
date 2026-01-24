# User Management - Feature Documentation

This document summarizes the core features and technical implementations for the **User Management** module, primarily located within the Admin application of the Gonza Systems monorepo.

---

## 1. Administrative Overview
The User Management module provides superadmins with granular control over all system participants across the platform.

*   **Centralized Control**: Manage users for both the Client and Admin portals from a single interface.
*   **Live Search & Filtering**: Real-time filtering by name, email, system role, and account status (Active/Frozen).
*   **System Roles**: 
    *   **Superadmin**: Full system access (Admin App).
    *   **Admin**: Full client management (Client App).
    *   **Manager**: Restricted client access.

---

## 2. Integrated User Actions
Administrators can perform the following lifecycle actions:

*   **User Details (Show)**: A comprehensive modal view displaying:
    *   **Profile Info**: Name, Email, Creation Date, and Access Level.
    *   **Activity Stats**: Real-time counts of Sales, Managed Products, Customers, and Stock Transfers.
    *   **Technical Identifiers**: Unique User ID and Last Update timestamp.
*   **Dynamic Editing**: Update user details (Name, Email, Role) without page reloads.
*   **Account Freezing**: 
    *   Instantly deactivate a user.
    *   **Enforcement**: Frozen users are blocked from logging in (including Google OAuth) and their active sessions are invalidated by the middleware.
*   **Secure Deletion**: Permanent removal of user accounts with confirmation safety.

---

## 3. Security & Access Control
*   **Implicit Permissions**: The shared `authGuard` is configured to implicitly grant `superadmin` users all permissions held by `admin` users, ensuring seamless navigation through the Client portal.
*   **Hybrid Middleware**: Utilizes Next.js middleware and a shared guard utility to block unauthorized access at the server level.

---

## 4. Technical Architecture
The module utilizes a decoupled architecture for robustness and performance.

| Layer | Responsibility |
| :--- | :--- |
| **API Controller** | `admin/src/users/api/controller.ts`: Server-side actions and input validation. |
| **Service Layer** | `admin/src/users/api/service.ts`: Prisma-based database orchestration and multi-table stat aggregation. |
| **Frontend UI** | `admin/src/users/ui/pages/UsersPage.tsx`: Modern, responsive dashboard with Tailwind CSS and Lucide icons. |

---

## 5. UI/UX Excellence
*   **Micro-animations**: Subtle hover effects and modal transitions for a premium feel.
*   **Stateful UI**: Real-time updates for status changes (Freezing/Unfreezing) with loading indicators.
*   **Status Badges**: High-contrast, color-coded badges for immediate recognition of account states.
