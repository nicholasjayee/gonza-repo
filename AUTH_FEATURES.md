# Auth App - Feature Documentation

This document summarizes the core features and technical implementations for the **Auth** application in the Gonza Systems monorepo.

---

## 1. Google OAuth 2.0 Integration
We have implemented a full Google OAuth flow for seamless user sign-in and sign-up.

*   **Initiation**: Users are redirected to Google via the `/api/auth/google` route.
*   **Callback Handling**: The `/api/auth/google/callback` route handles token exchange, user identification, and session creation.
*   **Auto-Account Linking**: If a user exists with the same email but no Google account linked, the system automatically links them upon successful OAuth.
*   **Role Assignment**: New users created via Google are assigned the **'admin'** role by default (Client App access).

---

## 2. Real-Time Email Service
The mock console-based email service has been replaced with a real delivery system.

*   **Provider**: Integrated with **Nodemailer** and optimized for **Gmail SMTP**.
*   **Features**:
    *   **Password Reset**: Sends production-ready HTML emails with secure tokens and reset links.
*   **Security**: Configured to work with Google **App Passwords** for accounts with 2FA.

---

## 3. Persistent User Sessions
User state is managed across three portals (Client, Admin, Website) using a hybrid cookie strategy.

*   **`refreshToken`**: A secure, `HttpOnly` cookie used for backend session validation.
*   **`userData`**: A non-HttpOnly cookie containing the user's name, email, and role initials. This allows the frontend to show the user's profile immediately on load without extra API calls.

---

## 4. UI & User Experience
*   **"Continue with Google"**: Integrated directly into both Login and Signup pages.
*   **Enhanced Signup**: Added a full registration flow including full name collection and password confirmation.
*   **Dynamic Sidebar/Topbar**: Components automatically detect the `userData` cookie to display the user's name and initials (e.g., "JD" for John Doe) across the entire platform.

---

## 5. Role-Based Access Control (RBAC) & Permissions
The system uses a granular RBAC model to ensure users only access the data and applications they are authorized for.

### Role & App Mapping
Roles define which portal within the monorepo a user can access:

| Role | Primary App | Access Level |
| :--- | :--- | :--- |
| **Superadmin** | Admin App (`code/admin`) | System-wide management and configuration. |
| **Admin** | Client App (`code/client`) | Full access to business operations and campaign management. |
| **Manager** | Client App (`code/client`) | Read-only or restricted operational access. |

### Permissions System
Permissions are assigned to roles to control specific actions within an application:

*   **`users:view`**: Allows the user to view the list of teammates and their profiles.
*   **`users:edit`**: Allows the user to create, update, or deactivate user accounts.

**Role-Permission Matrix:**
- **Superadmin**: `users:view`, `users:edit`
- **Admin**: `users:view`, `users:edit`
- **Manager**: `users:view` (limited access)

---

## 6. Middleware & Route Protection

Server-side protection is enforced to prevent unauthorized access to the `client` and `admin` applications. This logic is centralized to ensure consistency across the monorepo.

### Shared Auth Guard
A shared utility function, `authGuard`, is located in `@gonza/shared/middleware/authGuard.ts`. It performs the following checks:
1.  **Session Validation**: Verifies the presence of the `refreshToken` cookie.
2.  **Role Verification**: Decodes the `userData` cookie and checks if the user's role matches the allowed roles for the requesting application.
3.  **Redirects**: Returns a redirect path (to the Auth App) if validation fails.

### Application Middleware
Each Next.js application implements a root `middleware.ts` that utilizes the shared `authGuard`.

#### Client App (`code/client`)
- **Allowed Roles**: `admin`, `manager`, `superadmin`
- **Behavior**: Unauthenticated users or users with insufficient permissions are redirected to the Auth App (`http://localhost:3001`).
- **File**: `code/client/src/middleware.ts`

#### Admin App (`code/admin`)
- **Allowed Roles**: `superadmin` ONLY
- **Behavior**: Strict access control; only superadmins can access routes. Others are redirected to Auth.
- **File**: `code/admin/src/middleware.ts`

### Handling "Middleware to Proxy" Warning
*Note: You may see a "middleware file convention is deprecated" warning in the terminal. This is a known false positive in some Next.js versions/configurations. The `middleware.ts` file IS correctly executing and protecting routes as verified by logs and testing.*

## 7. Hydration Conflict Management
*   Implemented `suppressHydrationWarning` on root layouts and structural components to prevent browser extensions (like Scrnli) from breaking the React reconciliation process during page load.
