"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BranchSettings } from '@prisma/client';

interface SettingsContextType {
    settings: Partial<BranchSettings>;
    currency: string;
    refreshSettings: (newSettings?: Partial<BranchSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
    children,
    initialSettings
}: {
    children: React.ReactNode,
    initialSettings?: Partial<BranchSettings>
}) {
    const [settings, setSettings] = useState<Partial<BranchSettings>>(initialSettings || {});

    const refreshSettings = (newSettings?: Partial<BranchSettings>) => {
        if (newSettings) {
            setSettings(prev => ({ ...prev, ...newSettings }));
        }
    };

    const currency = settings.currency || 'UGX';

    return (
        <SettingsContext.Provider value={{ settings, currency, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
