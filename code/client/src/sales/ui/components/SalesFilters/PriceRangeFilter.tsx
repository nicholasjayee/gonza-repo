import React from 'react';
import { Tag } from 'lucide-react';
import { SalesFiltersState } from './types';

interface PriceRangeFilterProps {
    filters: SalesFiltersState;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ filters, onChange }) => {
    const inputClasses = "w-full h-10 px-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-xs font-medium";
    const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5 block px-1";

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span className={labelClasses.replace("mb-1.5", "")}>Price Range</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={onChange}
                    className={inputClasses}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={onChange}
                    className={inputClasses}
                />
            </div>
        </div>
    );
};
