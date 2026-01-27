import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-white">
      {/* Optimized background image with lazy loading fallback */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/lovable-uploads/5de523b3-1d7b-4772-9dd4-ba050fa3fba3.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform'
        }}
      />
      <div className="absolute inset-0 bg-primary opacity-80"></div>
      <div className="relative z-10 text-center px-4 py-20">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
          All-in-One Business Tracker
        </h1>
        <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
          Track Sales, Profits & Expenses, and Instantly Generate Receipts, Invoices & Quotes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{animationDelay: '0.6s'}}>
          <Button size="lg" asChild className="bg-secondary text-white font-bold py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg hover:bg-secondary/90 transition-transform transform hover:scale-105">
            <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}`}>
              Get Started for Free
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="bg-white/10 text-white border-white hover:bg-white hover:text-primary font-bold py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-transform transform hover:scale-105">
            <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}`}>
              Login
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
