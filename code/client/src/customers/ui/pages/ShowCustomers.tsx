"use client";

import React from 'react';
import { CustomerTable } from '../components/CustomerTable';

export default function ShowCustomers() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customer Directory</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Customer</button>
            </div>
            <CustomerTable />
        </div>
    );
}
