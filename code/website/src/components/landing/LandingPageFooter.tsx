import Link from 'next/link';

const LandingPageFooter = () => (
  <footer className="bg-gray-800 text-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p>&copy; {new Date().getFullYear()} Gonza Systems. All rights reserved.</p>
      <div className="mt-4">
        <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </div>
    </div>
  </footer>
);

export default LandingPageFooter;
