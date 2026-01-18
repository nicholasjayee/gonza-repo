# Gonza Business Management System

> **Enterprise-Grade Operational Platform**  
> A unified, high-performance ecosystem for managing sales, inventory, finance, and multi-branch operations.

---

## 🎯 System Overview

Gonza is a comprehensive **ERP (Enterprise Resource Planning)** system designed to run modern businesses. It is architected as a **Monorepo** containing four specialized applications working in harmony:

| Application | Port | Role | Description |
|-------------|------|------|-------------|
| **🌐 Website** | `3000` | Public Facing | Marketing landing page, legal documents (Terms/Policy), and product showcase. |
| **🔐 Auth** | `3001` | Security | Centralized authentication provider. Handles Login, Signup, and Session Management. |
| **💼 Client** | `3002` | Operations | The core business dashboard. Used by staff and managers for day-to-day operations (POS, Inventory, etc). |
| **🔧 Admin** | `3003` | Governance | Super-admin terminal for system-wide configuration, user management, and global analytics. |

---

## 🏗️ Project Anatomy (File Tree)

This project uses **Vertical Slice Architecture** to keep code modular and manageable.

### 🌳 Root Directory
```text
c:/Users/derri/Desktop/Gonza/
├── package.json          # 📦 Monorepo Root (Defines the 4 workspaces)
├── code/                 # 📂 Source Code
│   ├── website/          # 🌐 App 1: Public Website
│   ├── auth/             # 🔐 App 2: Authentication
│   ├── client/           # 💼 App 3: Client Portal (Main App)
│   ├── admin/            # 🔧 App 4: Admin Portal
│   └── shared/           # 🔗 Shared Libraries (Config, Utils)
```

### 🍰 Vertical Slice Structure (Client & Admin)
```text
module(Sales, Inventory, Customers ...)/
├── controller          # 🎮 Route Handlers & Input Validation
├── model                # 🗄️ Database Schemas & Types
├── service              # 🧠 Business Logic & Data Access
│
└── ui/                   # 🎨 Frontend Presentation
    ├── components/       # React Components (e.g., SalesChart.tsx)
    ├── hooks/            # Custom Hooks (e.g., useDailySales.ts)
    └── pages/            # Page Views (e.g., SalesPage.tsx)
```

---

## 🧭 Lean Routing Architecture

We utilize a **Catch-All Routing Strategy** to keep the `app` folder clean and scalable.

*   **Old Way**: `app/sales/page.tsx`, `app/inventory/page.tsx`... (Hundreds of folders)
*   **Gonza Way**: `app/[[...slug]]/page.tsx` (One dynamic file)

This single file dynamically loads the correct module from `src/{module}/ui/pages` based on the URL.

---

## 📦 Module Inventory

### 💼 Client Portal (`src/code/client`)
The control center for business owners and staff.

| Module | Purpose |
|--------|---------|
| **📊 Dashboard** | Real-time overview of revenue, active orders, and profit. |
| **💵 Sales** | Point of Sale (POS), Order History, and Transaction Management. |
| **👥 Customers** | CRM database, interaction history, and loyalty tracking. |
| **📦 Products** | Product catalog, pricing strategies, and categorization. |
| **🏪 Inventory** | Stock level algorithms, reorder alerts, and warehouse management. |
| **💳 Expenses** | Operational cost tracking and expense categorization. |
| **💰 Finance** | General Ledger, Profit & Loss reports, and cash flow analysis. |
| **📧 Messaging** | Unified inbox for customer communication (formerly the main focus). |
| **✅ Tasks** | Staff workflow management and assignment tracking. |
| **🏢 Branches** | Multi-location management and synchronisation. |
| **🛟 Support** | Internal helpdesk and ticketing system. |
| **⚙️ Settings** | Global account configuration. |

### 🔧 Admin Terminal (`src/code/admin`)
For system administrators and platform owners.

| Module | Purpose |
|--------|---------|
| **📊 Dashboard** | System health APIs, server metrics, and error logging. |
| **👤 Users** | Role-Based Access Control (RBAC) and user provisioning. |
| **📈 Analytics** | Global usage trends and data throughput analysis. |
| **⚙️ Settings** | System-wide flags and environment configuration. |

---

## 🚀 Getting Started

### 1. Installation
Assuming Node.js v18+ is installed:

```bash
# Install dependencies for all 4 apps
npm install
```

### 2. Running Locally
Launch the entire ecosystem with one command:

```bash
npm run dev
```
*This starts all 4 applications on ports using `concurrently`.*

### 3. Build for Production
Each app is deployment-ready:

```bash
# Build specific app
npm run build --prefix code/client
```

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (App Router)
*   **Bundler**: Turbopack
*   **Styling**: Tailwind CSS v4 (with custom "Premium Design" system)
*   **Type Safety**: TypeScript 5.0
*   **State**: React Hooks & Server Actions
*   **Architecture**: Monorepo + Vertical Slices

---

**© 2026 Gonza Systems** | *Engineered for Scale*
