import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gonza Systems | Enterprise Business Management",
  description: "Master your operations with Gonza Systems. Unified platform for sales, inventory, and comprehensive business management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

