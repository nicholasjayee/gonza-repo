import { useSettings } from '@/settings/api/SettingsContext';

/**
 * Custom hook to format currency values with the branch's configured currency
 */
export function useCurrency() {
    const { currency } = useSettings();

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `${currency} ${num.toLocaleString()}`;
    };

    return {
        currency,
        formatCurrency
    };
}
