import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    subtitle: string;
    subtitleIcon?: LucideIcon;
    subtitleText: string;
    colorClass: string;
    iconBgClass: string;
    iconColorClass: string;
    subtitleColorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    icon: Icon,
    title,
    value,
    subtitle,
    subtitleIcon: SubtitleIcon,
    subtitleText,
    colorClass,
    iconBgClass,
    iconColorClass,
    subtitleColorClass
}) => {
    return (
        <div className={`${colorClass} border border-border/50 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${iconBgClass} rounded-2xl flex items-center justify-center ${iconColorClass} group-hover:bg-opacity-100 group-hover:text-white transition-all`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${subtitleColorClass} mb-1`}>{title}</span>
                    <div className={`flex items-center gap-1 ${iconColorClass}`}>
                        {SubtitleIcon && <SubtitleIcon className="w-3 h-3" />}
                        <span className="text-[10px] font-black tracking-tighter">{subtitleText}</span>
                    </div>
                </div>
            </div>
            <div>
                <h3 className={`text-3xl font-black tracking-tight mb-1 ${iconColorClass}`}>{value}</h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${subtitleColorClass}/60`}>{subtitle}</p>
            </div>
        </div>
    );
};
