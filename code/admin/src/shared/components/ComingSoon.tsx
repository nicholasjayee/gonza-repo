"use client";

import React from 'react';

export const ComingSoon: React.FC<{ color?: string }> = ({ color = 'bg-red-600' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <div className={`h-20 w-20 rounded-3xl ${color}/10 flex items-center justify-center ${color.replace('bg-', 'text-')} mb-6`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Module Coming Soon</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                This administration feature is currently under development. Please check back later.
            </p>
            <button
                onClick={() => window.history.back()}
                className={`mt-8 px-6 py-2 ${color} text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20`}
            >
                Return to Control
            </button>
        </div>
    );
};
