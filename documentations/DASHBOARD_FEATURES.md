# Admin Dashboard - Feature Documentation

This document summarizes the features and technical implementation of the **Admin Dashboard**, the central command hub of the Gonza Systems Admin portal.

---

## 1. System-Wide Analytics
The dashboard provides a high-level, real-time overview of the entire ecosystem's health and performance.

*   **Metric Cards**:
    *   **Total Revenue**: Aggregated sum of all sales across all branches.
    *   **Active Users**: Live count of users currently authorized and active in the system.
    *   **Global Inventory**: Total count of unique products registered.
    *   **System Load**: Monitoring station for hardware performance.
*   **Trend Visualization**: Monthly revenue analytics chart showing performance fluctuations over the year.

---

## 2. Real-Time Activity Monitoring
A dedicated feed tracks critical system events as they happen.

*   **User Signups**: Instant notification when new admins or managers join the platform.
*   **Sale Completions**: Tracking of high-level transactions with customer details.
*   **Audit Readiness**: Provides the foundation for a full system audit ledger.

---

## 3. Hardware & Health Diagnostics
Ensuring system reliability through integrated monitoring tools.

*   **CPU & Memory Usage**: Visual progress bars mapping current server utilization.
*   **Status Indicators**: "Live Monitor" and "Healthy" status pulses to confirm system uptime.
*   **Last Snapshot**: Tracking of the last successful database backup.

---

## 4. Navigation & Global Controls
*   **Full App Refresh**: A hard-reload utility to clear transient client/server states and pull fresh data.
*   **Quick App Switching**: Direct link to the Client Portal for seamless administrative transitions.
*   **Dark Mode Support**: Fully integrated with the system theme toggle for comfortable monitoring.

---

## 5. Technical Stack
| Component | Implementation |
| :--- | :--- |
| **Data Fetching** | `AdminDashboardService` (Prisma multi-aggregate). |
| **Visuals** | Tailwind CSS custom bar charts and Lucide icon set. |
| **UX** | Framer-motion like transitions (CSS `animate-in`) and state-aware components. |
