import React from 'react';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { PaymentStatus } from '@/sales/types';
import { Search } from 'lucide-react';

interface SalesTableFiltersProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    paymentFilter: PaymentStatus | 'all';
    setPaymentFilter: (value: PaymentStatus | 'all') => void;
    dateFilter: string;
    setDateFilter: (value: string) => void;
}

const SalesTableFilters: React.FC<SalesTableFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    dateFilter,
    setDateFilter
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by customer name, receipt #, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Payment Status Filter */}
            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="QUOTE">Quote</SelectItem>
                    <SelectItem value="INSTALLMENT">Installment</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default SalesTableFilters;
