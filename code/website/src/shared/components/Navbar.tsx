"use client";

import React from 'react';

export const Navbar: React.FC = () => {
    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">GONZA</div>
                <ul className="hidden md:flex space-x-10 text-sm font-medium">
                    <li className="hover:text-blue-600 cursor-pointer transition">Solutions</li>
                    <li className="hover:text-blue-600 cursor-pointer transition">Pricing</li>
                    <li className="hover:text-blue-600 cursor-pointer transition">Resources</li>
                </ul>
                <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200">Get Started</button>
            </div>
        </nav>
    );
};
