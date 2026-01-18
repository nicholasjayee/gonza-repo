"use client";

import React from 'react';
import { useShowcaseData } from '../hooks/useShowcaseData';
import { ShowcaseCard } from '../components/ShowcaseCard';

export default function ShowcasePage() {
    const { products, loading } = useShowcaseData();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Showcase...</div>;

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black mb-4">Powerful Solutions for Growth</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover how Gonza Systems helps businesses streamline operations and scale efficiently.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                    <ShowcaseCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
