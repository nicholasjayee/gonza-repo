"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/header/Logo';
import { Button } from '@/components/ui/button';

const LandingPageHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 py-2 sm:py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 bg-white/95 backdrop-blur-sm ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="p-1 sm:p-2 rounded-lg bg-white shadow-sm">
          <Logo />
        </div>
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm transition-colors text-gray-900 hover:bg-gray-800">
            <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}`}>
              Log In
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-white text-primary hover:bg-gray-200 text-xs sm:text-sm">
            <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}`}>
              Sign Up Free
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default LandingPageHeader;
