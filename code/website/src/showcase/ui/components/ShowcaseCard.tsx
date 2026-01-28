"use client";

import React from 'react';
import { ProductShowcase } from '../types';

export const ShowcaseCard: React.FC<{ product: ProductShowcase }> = ({ product }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl border dark:border-gray-800 transition hover:scale-[1.02] duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-4xl font-bold">
                {product.title[0]}
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>
                <button className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-semibold text-sm hover:bg-blue-600 hover:text-white transition">Learn More</button>
            </div>
        </div>
    );
};
