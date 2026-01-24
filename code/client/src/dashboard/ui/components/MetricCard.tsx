"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    bgColor?: string;
    iconColor?: string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    bgColor = "bg-card",
    iconColor = "text-primary"
}: MetricCardProps) {
    return (
        <div className={`${bgColor} border border-border rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all group`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${iconColor.replace('text-', 'bg-')}/10 rounded-2xl flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
                <h3 className="text-3xl font-black tracking-tight mb-1">{value}</h3>
                {subtitle && (
                    <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
