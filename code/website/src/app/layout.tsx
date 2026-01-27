import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/theme/ThemeProvider";

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
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

