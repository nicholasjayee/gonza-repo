"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    ShoppingBag,
    DollarSign,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    RefreshCw,
    Loader2,
    CheckCircle2,
    UserPlus,
    CreditCard
} from 'lucide-react';
import { getSystemStatsAction } from '@/dashboard/api/controller';

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getSystemStatsAction();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Initializing admin console...</p>
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Revenue',
            value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
            icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
            trend: '+12.5%',
            trendUp: true,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers?.toLocaleString() || '0',
            icon: <Users className="w-5 h-5 text-blue-500" />,
            trend: '+3.2%',
            trendUp: true,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Total Products',
            value: stats?.totalProducts?.toLocaleString() || '0',
            icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
            trend: '-0.4%',
            trendUp: false,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            title: 'System Load',
            value: 'Stable',
            icon: <Activity className="w-5 h-5 text-purple-500" />,
            trend: '99.9%',
            trendUp: true,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Live analytics and hardware performance metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Data
                    </button>
                    <div className="h-4 w-px bg-border hidden md:block"></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">Status: Healthy</span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="group p-6 bg-background border border-border rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                {card.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] font-bold ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {card.trend}
                                {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Placeholder for now) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 bg-background border border-border rounded-[32px] overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">Revenue Analytics</h3>
                                <p className="text-sm text-muted-foreground">Monthly revenue performance</p>
                            </div>
                            <select className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none">
                                <option>Last 30 Days</option>
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>

                        {/* Placeholder for actual chart */}
                        <div className="h-[300px] flex items-end justify-between gap-2 px-2">
                            {[40, 70, 45, 90, 65, 80, 55, 30, 85, 60, 45, 75].map((h, i) => (
                                <div key={i} className="flex-1 group/bar relative">
                                    <div
                                        className="w-full bg-primary/20 group-hover/bar:bg-primary rounded-t-lg transition-all duration-500 ease-out"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                        ${h}k
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>Jan</span>
                            <span>Mar</span>
                            <span>May</span>
                            <span>Jul</span>
                            <span>Sep</span>
                            <span>Nov</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-background border border-border rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold">System Load</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-muted-foreground uppercase">CPU Usage</span>
                                        <span>42%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[42%] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-muted-foreground uppercase">Memory Usage</span>
                                        <span>68%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[68%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-background border border-border rounded-3xl flex flex-col justify-center text-center space-y-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold">Last Snapshot</h4>
                                <p className="text-sm text-muted-foreground">System backup completed successfully</p>
                            </div>
                            <p className="text-xs font-bold text-primary bg-primary/10 py-1 px-3 rounded-full w-fit mx-auto">
                                2 Hours Ago
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Recent Activity */}
                <div className="p-8 bg-background border border-border rounded-[32px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Recent Activity</h3>
                        <Activity className="w-5 h-5 text-muted-foreground/30" />
                    </div>

                    <div className="space-y-6 flex-1">
                        {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 ${item.type === 'user_registered' ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
                                        }`}>
                                        {item.type === 'user_registered' ? <UserPlus className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                    </div>
                                    {i !== stats.recentActivity.length - 1 && (
                                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border"></div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 grayscale opacity-50">
                                <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">No recent events tracked</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-8 w-full py-3 rounded-2xl bg-muted hover:bg-muted/80 text-xs font-bold transition-all border border-border">
                        View Audit Ledger
                    </button>
                </div>
            </div>
        </div>
    );
}
