"use client";

import React from 'react';

export const Footer = () => (
    <footer className="border-t border-white/10 bg-black py-20 px-6">
        <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-20">
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-6 w-6 rounded bg-white flex items-center justify-center">
                            <span className="text-black font-bold text-xs">G</span>
                        </div>
                        <span className="font-medium text-white">Gonza</span>
                    </div>
                    <p className="text-sm text-white/40 max-w-xs">
                        Designing the future of enterprise resource planning. Built in San Francisco.
                    </p>
                </div>
                <div>
                    <h4 className="font-medium text-white mb-6">Product</h4>
                    <ul className="space-y-4 text-sm text-white/40">
                        <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-medium text-white mb-6">Company</h4>
                    <ul className="space-y-4 text-sm text-white/40">
                        <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-medium text-white mb-6">Legal</h4>
                    <ul className="space-y-4 text-sm text-white/40">
                        <li><a href="/policy" className="hover:text-white transition-colors">Privacy</a></li>
                        <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                    </ul>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                <p className="text-xs text-white/20">&copy; 2026 Gonza Systems Inc. All rights reserved.</p>
                <div className="flex gap-6">
                    {/* Social Icons would go here */}
                </div>
            </div>
        </div>
    </footer>
);
