import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <Image 
        src="/lovable-uploads/798d07d7-1db7-498c-92f3-6f6346827d59.png" 
        alt="Gonzo Systems Logo" 
        width={150}
        height={40}
        className="h-8 md:h-10 w-auto" 
      />
    </Link>
  );
};

export default Logo;
