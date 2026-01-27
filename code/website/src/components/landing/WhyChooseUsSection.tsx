import Link from 'next/link';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/landing/OptimizedImage';

const WhyChooseUsSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 md:text-4xl">Focus on what matters most</h2>
                    <p className="mt-4 text-base sm:text-lg text-gray-600">
                       Stop wasting time with spreadsheets and manual bookkeeping. Our app automates your sales and expense tracking, giving you more time to focus on growing your business.
                    </p>
                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start">
                            <div className="shrink-0">
                                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="ml-3 text-sm sm:text-base text-gray-600">Simple and intuitive interface.</p>
                        </li>
                         <li className="flex items-start">
                            <div className="shrink-0">
                                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="ml-3 text-sm sm:text-base text-gray-600">Powerful analytics to drive decisions.</p>
                        </li>
                        <li className="flex items-start">
                            <div className="shrink-0">
                                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="ml-3 text-sm sm:text-base text-gray-600">Secure and reliable cloud storage.</p>
                        </li>
                    </ul>
                     <div className="mt-8">
                        <Button variant="link" asChild className="text-base sm:text-lg p-0 h-auto">
                            <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}`}>
                                Start your free trial today &rarr;
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="mt-10 md:mt-0">
                    <OptimizedImage 
                      src="/lovable-uploads/bede0452-5ece-46ae-acae-25f8d98fbfd2.png" 
                      alt="Team analyzing business data" 
                      className="rounded-lg shadow-xl w-full h-auto"
                    />
                </div>
            </div>
        </div>
    </section>
  );
};

export default WhyChooseUsSection;
