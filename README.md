# GONZA SYSTEMS

> **Enterprise Business Management Platform**  
> A unified system for sales, inventory, finance, and multi-branch operations.

---

## 📋 Overview

Gonza Systems is a modern, scalable business management platform built with a **Vertical Slice Architecture**. Each domain module is self-contained with its own API, UI, and business logic, ensuring maximum maintainability and scalability.

### Key Features
- 📊 **Sales Management** – Track orders, revenue, and customer transactions
- 📦 **Inventory Control** – Real-time stock tracking and automated rebalancing
- 💰 **Financial Ledger** – Unified expense and income management
- 🏢 **Multi-Branch Operations** – Centralized control across locations
- 👥 **Customer Relationship Management** – Comprehensive customer database
- 📈 **Analytics Dashboard** – Real-time business intelligence

---

## 🏗️ Architecture

The project follows a **monorepo structure** with npm workspaces, containing four Next.js applications and a shared library.

```
gonza-workspace/
├── package.json                 # Root workspace configuration
├── README.md                    # Project documentation
│
└── code/
    ├── website/                 # 🌐 Marketing Website (Port 3000)
    │   └── src/
    │       ├── app/
    │       │   ├── page.tsx         # Landing page
    │       │   ├── terms/           # Terms & Conditions
    │       │   ├── policy/          # Privacy Policy
    │       │   ├── layout.tsx
    │       │   └── globals.css
    │       ├── shared/
    │       └── showcase/
    │
    ├── auth/                    # 🔐 Authentication Module (Port 3001)
    │   └── src/
    │       ├── app/
    │       │   ├── page.tsx         # Login/Signup page
    │       │   ├── layout.tsx
    │       │   └── globals.css
    │       └── sessions/
    │
    ├── client/                  # 💼 Client Portal (Port 3002)
    │   └── src/
    │       ├── app/
    │       │   ├── [[...slug]]/     # Catch-all router
    │       │   │   └── page.tsx
    │       │   ├── layout.tsx
    │       │   └── globals.css
    │       │
    │       ├── shared/              # Cross-module components
    │       │   └── components/
    │       │       ├── Sidebar.tsx
    │       │       ├── Topbar.tsx
    │       │       └── ComingSoon.tsx
    │       │
    │       ├── dashboard/           # 📊 Dashboard Module
    │       │   ├── api/
    │       │   └── ui/
    │       │       ├── components/
    │       │       ├── hooks/
    │       │       └── pages/
    │       │           └── Dashboard.tsx
    │       │
    │       ├── sales/               # 💵 Sales Module
    │       │   ├── api/
    │       │   └── ui/
    │       │       ├── components/
    │       │       ├── hooks/
    │       │       └── pages/
    │       │           └── SalesPage.tsx
    │       │
    │       ├── customers/           # 👥 Customers Module
    │       ├── products/            # 📦 Products Module
    │       ├── inventory/           # 🏪 Inventory Module
    │       ├── expenses/            # 💳 Expenses Module
    │       ├── finance/             # 💰 Finance Module
    │       ├── messaging/           # 📧 Messaging Module
    │       ├── tasks/               # ✅ Tasks Module
    │       ├── branches/            # 🏢 Branches Module
    │       ├── support/             # 🛟 Support Module
    │       └── settings/            # ⚙️ Settings Module
    │
    ├── admin/                   # 🔧 Admin Terminal (Port 3003)
    │   └── src/
    │       ├── app/
    │       │   ├── [[...slug]]/     # Catch-all router
    │       │   │   └── page.tsx
    │       │   ├── layout.tsx
    │       │   └── globals.css
    │       │
    │       ├── shared/              # Cross-module components
    │       │   └── components/
    │       │       ├── Sidebar.tsx
    │       │       ├── Topbar.tsx
    │       │       └── ComingSoon.tsx
    │       │
    │       ├── dashboard/           # 📊 Admin Dashboard
    │       │   └── ui/
    │       │       ├── components/
    │       │       ├── hooks/
    │       │       └── pages/
    │       │           └── Dashboard.tsx
    │       │
    │       ├── users/               # 👤 User Management
    │       │   └── ui/
    │       │       ├── components/
    │       │       ├── hooks/
    │       │       └── pages/
    │       │           └── UsersPage.tsx
    │       │
    │       ├── analytics/           # 📈 Analytics Module
    │       └── settings/            # ⚙️ Admin Settings
    │
    └── shared/                  # 🔗 Shared Libraries
        ├── config/                  # Configuration utilities
        ├── infra/                   # Infrastructure helpers
        ├── middleware/              # Shared middleware
        └── utils/                   # Common utilities
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **npm** v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/gonza-system.git
cd gonza-system

# Install all dependencies (workspaces)
npm install
```

### Development

```bash
# Start all applications concurrently
npm run dev
```

This will start:
| Application | Port | URL |
|-------------|------|-----|
| Website | 3000 | http://localhost:3000 |
| Auth | 3001 | http://localhost:3001 |
| Client | 3002 | http://localhost:3002 |
| Admin | 3003 | http://localhost:3003 |

### Individual App Development

```bash
npm run dev:website   # Start only the website
npm run dev:auth      # Start only the auth module
npm run dev:client    # Start only the client portal
npm run dev:admin     # Start only the admin terminal
```

---

## 🧱 Module Structure (Vertical Slice)

Each business module follows a consistent vertical slice pattern:

```
{module}/
├── api/                 # Backend API routes and services
│   ├── routes/
│   └── services/
│
└── ui/                  # Frontend presentation layer
    ├── components/      # Module-specific React components
    ├── hooks/           # Module-specific custom hooks
    └── pages/           # Module page components
```

---

## 🎨 Design System

The platform uses a consistent design system across all applications:

- **Typography**: System font stack (SF Pro, Segoe UI, Roboto)
- **Primary Theme**: Blue (`#2563eb`) for Client Portal
- **Admin Theme**: Red (`#dc2626`) for Admin Terminal
- **Effects**: Glassmorphism, subtle shadows, micro-animations
- **CSS Framework**: Tailwind CSS v4

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS v4 |
| **Language** | TypeScript |
| **Package Manager** | npm Workspaces |
| **Build Tool** | Turbopack |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all applications |
| `npm run dev:website` | Start website only |
| `npm run dev:auth` | Start auth only |
| `npm run dev:client` | Start client portal only |
| `npm run dev:admin` | Start admin terminal only |
| `npm run install:all` | Install all dependencies |

---

## 📄 License

Copyright © 2026 Gonza Systems. All rights reserved.

---

## 🔗 Links

- **Website**: [http://localhost:3000](http://localhost:3000)
- **Client Portal**: [http://localhost:3002](http://localhost:3002)
- **Admin Terminal**: [http://localhost:3003](http://localhost:3003)
