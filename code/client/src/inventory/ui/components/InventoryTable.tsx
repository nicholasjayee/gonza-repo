"use client";

import React from 'react';
import { useInventoryData } from '../hooks/useInventoryData';

export const InventoryTable: React.FC = () => {
    const { items, loading, error } = useInventoryData();

    if (loading) return <div>Loading inventory...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-2 text-left">Item Name</th>
                        <th className="px-4 py-2 text-left">Stock Level</th>
                        <th className="px-4 py-2 text-left">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2 font-mono">{item.stock}</td>
                            <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
