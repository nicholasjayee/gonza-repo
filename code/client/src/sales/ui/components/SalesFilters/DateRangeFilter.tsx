import React from 'react';
import { Calendar } from 'lucide-react';
import { SalesFiltersState } from './types';

interface DateRangeFilterProps {
    filters: SalesFiltersState;
    onChange: (filters: Partial<SalesFiltersState>) => void;
    onPresetChange: (preset: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ filters, onChange, onPresetChange }) => {
    const inputClasses = "w-full h-10 px-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-xs font-medium";
    const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5 block px-1";

    return (
        <div className="col-span-1 lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 px-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className={labelClasses.replace("mb-1.5", "")}>Timeline Selection</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                    value={filters.datePreset || ''}
                    onChange={(e) => onPresetChange(e.target.value)}
                    className={inputClasses}
                >
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this-week">This Week</option>
                    <option value="last-week">Last Week</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-year">This Year</option>
                    <option value="last-year">Last Year</option>
                    <option value="specific">Specific Date</option>
                    <option value="custom">Custom Range</option>
                </select>

                {(filters.datePreset === 'specific' || filters.datePreset === 'custom') && (
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (filters.datePreset === 'specific') {
                                onChange({ startDate: val, endDate: val });
                            } else {
                                onChange({ startDate: val });
                            }
                        }}
                        className={inputClasses}
                    />
                )}
                {filters.datePreset === 'custom' && (
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={(e) => onChange({ endDate: e.target.value })}
                        className={inputClasses}
                    />
                )}
            </div>
        </div>
    );
};
