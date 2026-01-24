
import React, { useState, useEffect } from 'react';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
    currency?: string;
    className?: string;
}

import { useSettings } from "@/settings/api/SettingsContext";

export function MoneyInput({ value, onChange, className, currency, ...props }: MoneyInputProps) {
    const { currency: defaultCurrency } = useSettings();
    const activeCurrency = currency || defaultCurrency;
    // Format number to string with commas
    const formatValue = (num: number) => {
        if (isNaN(num)) return "";
        return num.toLocaleString('en-US');
    };

    const [inputValue, setInputValue] = useState(formatValue(value));

    useEffect(() => {
        setInputValue(formatValue(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');

        // Allow only numbers and one decimal point
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            setInputValue(e.target.value);

            const numericValue = parseFloat(rawValue);
            if (!isNaN(numericValue)) {
                onChange(numericValue);
            } else {
                onChange(0);
            }
        }
    };

    const handleBlur = () => {
        setInputValue(formatValue(value));
    };

    return (
        <div className="relative w-full group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-[10px] font-black tracking-widest pointer-events-none group-focus-within:text-primary/70 transition-colors">
                {activeCurrency}
            </span>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full h-11 pl-12 pr-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm text-right font-medium ${className || ""}`}
                {...props}
            />
        </div>
    );
}
