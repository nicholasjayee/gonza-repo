# Project Setup & Configuration Guide

This document details the setup process for the Gonza Systems project, including Database (Prisma 7), Authentication (Google OAuth), and Email (SMTP).

---

## 1. Prisma & Database Setup

Gonza Systems uses **Prisma 7** with the `@prisma/adapter-pg` driver adapter. The configuration is split between the schema, a config file, and a custom client instantiation.

### Configuration Files:

*   **`code/shared/prisma/schema.prisma`**: The standard schema definition. Note that the `url` is managed via the config file.
*   **`code/shared/prisma.config.ts`**: The central config for Prisma. It tells Prisma where your schema is and how to run the seed script.
*   **`code/shared/prisma/db.ts`**: Handles the manual Driver Adapter setup. It instantiates `PrismaClient` with the `adapter` option, which is mandatory in this setup.

### Key Commands:
Run these commands from the root directory:

*   **Generate Prisma Client**:
    ```bash
    npm run db:generate
    ```
*   **Push Schema**: Syncs `schema.prisma` directly to the database.
    ```bash
    npm run db:push
    ```
*   **Seed Database**: Populates the database using `prisma/seed.ts`.
    ```bash
    npm run db:seed
    ```

---

## 2. Google OAuth 2.0 Setup

Used for "Continue with Google" functionality in the `auth` app.

### Configuration Steps:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **APIs & Services > Credentials**.
3.  Create **OAuth 2.0 Client IDs** (Web Application).
4.  Add the **Authorized Redirect URI**:
    *   `http://localhost:3001/api/auth/google/callback`
5.  Copy your Client ID and Client Secret into `code/shared/.env`:
    ```env
    GOOGLE_CLIENT_ID=your_id_here
    GOOGLE_CLIENT_SECRET=your_secret_here
    ```

---

## 3. SMTP (Email) Setup

Used for sending password reset emails via the `auth` application.

### Configuration Steps (Gmail):
To use Gmail, you must generate an **App Password**.

1.  Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords).
2.  Create a "Mail" password.
3.  Update `code/shared/.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=noreply@gonzasystems.com
```

---

## 4. Environment Variables Summary

All sensitive configuration is stored in `code/shared/.env`.

Required variables:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: For auth tokens.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For OAuth.
- `SMTP_*`: Credentials for email delivery.
