import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="bg-primary">
      <div className="max-w-4xl mx-auto text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white md:text-4xl">
          <span className="block">Ready to dive in?</span>
          <span className="block">Start simplifying your business today.</span>
        </h2>
        <Button size="lg" asChild className="mt-8 bg-white text-primary hover:bg-gray-200">
          <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}`}>
            Sign Up for Free
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
