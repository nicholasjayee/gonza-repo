import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auth | Gonza Systems",
  description: "Secure access to your Gonza Systems account.",
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

