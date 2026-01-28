"use client";

import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-50 dark:bg-gray-950 border-t dark:border-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <div className="text-2xl font-black">GONZA</div>
                    <p className="text-gray-500 text-sm">Empowering businesses with enterprise-grade vertical solutions.</p>
                </div>
                {/* Site links */}
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t dark:border-gray-900 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Gonza Systems. All rights reserved.
            </div>
        </footer>
    );
};
