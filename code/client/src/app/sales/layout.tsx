
import type { Metadata } from "next";

import "../globals.css";
import { Providers } from "@/components/ui/providers";

export const metadata: Metadata = {
  title: "Gonza Systems",
  description: "Business Management System",
};

export default function SalesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( //kendeza cabon equal stove sollar
    <Providers>
      {children}
    </Providers>
  );
}
