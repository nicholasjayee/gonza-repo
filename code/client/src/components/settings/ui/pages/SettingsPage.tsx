"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Building, Palette, Settings as SettingsIcon } from 'lucide-react';
import { getSettingsAction, updateSettingsAction } from '@/components/settings/api/controller';
import { useMessage } from '@/shared/ui/Message';
import { ImageUpload } from '../components/ImageUpload';

export default function SettingsPage() {
    const { showMessage, MessageComponent } = useMessage();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        businessName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        currency: 'UGX',
        logo: '',
        signatureImage: '',
        enableSignature: false
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await getSettingsAction();
                if (res.success && res.data) {
                    const data = res.data;
                    setSettings({
                        businessName: data.businessName || '',
                        address: data.address || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        website: data.website || '',
                        currency: data.currency || 'UGX',
                        logo: data.logo || '',
                        signatureImage: data.signatureImage || '',
                        enableSignature: data.enableSignature || false
                    });
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const formData = new FormData();

            // Append all text/boolean fields
            Object.entries(settings).forEach(([key, value]) => {
                // Skip URL fields if we are uploading new files, OR handle logically
                // Actually, backend needs strings if no file, but we designed controller to look for Files.
                // If we don't send file, we preserve old one in controller? 
                // Wait, basic update logic usually overwrites.
                // In controller: "if (logoFile) data.logo = ..." -> upsert
                // So regular fields are always sent.
                formData.append(key, String(value));
            });

            if (logoFile) formData.append('logo', logoFile);
            if (signatureFile) formData.append('signatureImage', signatureFile);

            const res = await updateSettingsAction(formData);

            if (res.success) {
                if (res.data) {
                    const data = res.data;
                    setSettings({
                        businessName: data.businessName || '',
                        address: data.address || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        website: data.website || '',
                        currency: data.currency || 'UGX',
                        logo: data.logo || '',
                        signatureImage: data.signatureImage || '',
                        enableSignature: data.enableSignature || false
                    });
                }
                showMessage('success', "Settings saved successfully!");
                // Clear file inputs state
                setLogoFile(null);
                setSignatureFile(null);
            } else {
                showMessage('error', res.error || "Failed to save settings");
            }
        } catch {
            showMessage('error', "An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const inputClasses = "w-full h-11 px-4 bg-muted/30 border border-border rounded-xl font-medium text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all";
    const labelClasses = "text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-2 block px-1";

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black italic tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Manage your branch identity and preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Branding Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Palette className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Branding</h3>
                        </div>

                        <ImageUpload
                            label="Business Logo"
                            value={settings.logo}
                            onChange={setLogoFile}
                            description="Appears on invoices and reports"
                        />

                        <div className="pt-4 border-t border-border/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Signature</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="enableSignature"
                                        checked={settings.enableSignature}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {settings.enableSignature && (
                                <ImageUpload
                                    label="Signature Image"
                                    value={settings.signatureImage}
                                    onChange={setSignatureFile}
                                    description="Upload a scan of your signature"
                                    className="animate-in fade-in slide-in-from-top-2"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* General Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Building className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Business Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Business Name</label>
                                <input
                                    name="businessName"
                                    value={settings.businessName || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. Gonza Global Ltd"
                                    className={inputClasses}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Address</label>
                                <input
                                    name="address"
                                    value={settings.address || ''}
                                    onChange={handleChange}
                                    placeholder="Street, City, Country"
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <input
                                    name="phone"
                                    value={settings.phone || ''}
                                    onChange={handleChange}
                                    placeholder="+256..."
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <input
                                    name="email"
                                    value={settings.email || ''}
                                    onChange={handleChange}
                                    placeholder="info@..."
                                    className={inputClasses}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Website</label>
                                <input
                                    name="website"
                                    value={settings.website || ''}
                                    onChange={handleChange}
                                    placeholder="https://"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <SettingsIcon className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Preferences</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Default Currency</label>
                                    <select
                                        name="currency"
                                        value={settings.currency}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    >
                                        <option value="UGX">UGX (Ugandan Shilling)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                        <option value="KES">KES (Kenyan Shilling)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="h-12 px-8 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            {MessageComponent}
        </div>
    );
}
