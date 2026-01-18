"use client";

import React from 'react';
import { useSalesData } from '../hooks/useSalesData';

export const SalesTable: React.FC = () => {
    const { sales, loading, error } = useSalesData();

    if (loading) return <div>Loading sales...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-2 text-left">Customer</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-2">{sale.customer}</td>
                            <td className="px-4 py-2">${sale.amount.toFixed(2)}</td>
                            <td className="px-4 py-2">{new Date(sale.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
