import React from 'react';
import LandingPageHeader from '@/components/landing/LandingPageHeader';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WhyChooseUsSection from '@/components/landing/WhyChooseUsSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <div className="bg-white font-sans min-h-screen">
      <LandingPageHeader />

      <main className="pt-16 sm:pt-20">
        <HeroSection />
        <FeaturesSection />
        <WhyChooseUsSection />
        <CTASection />
      </main>

      <LandingPageFooter />
    </div>
  );
}
