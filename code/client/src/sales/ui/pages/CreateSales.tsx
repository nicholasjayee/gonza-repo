"use client";

import React from 'react';

export default function CreateSales() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create New Sale</h1>
            <form className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium">Customer Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input type="number" className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 shadow-sm" />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Sale
                </button>
            </form>
        </div>
    );
}
