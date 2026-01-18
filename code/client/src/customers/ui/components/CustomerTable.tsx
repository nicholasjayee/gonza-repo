"use client";

import React from 'react';
import { useCustomerData } from '../hooks/useCustomerData';

export const CustomerTable: React.FC = () => {
    const { customers, loading, error } = useCustomerData();

    if (loading) return <div>Loading customers...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-2">{customer.name}</td>
                            <td className="px-4 py-2">{customer.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
