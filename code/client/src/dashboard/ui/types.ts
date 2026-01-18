export interface DashboardMetrics {
    totalSales: number;
    revenue: number;
    expenses: number;
    profit: number;
    lowStockCount: number;
    outstandingBalance: number;
}

export interface Shortcut {
    label: string;
    path: string;
    icon: string;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    shortcuts: Shortcut[];
}
