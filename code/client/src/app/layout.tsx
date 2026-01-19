import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/shared/components/Sidebar";
import { Topbar } from "@/shared/components/Topbar";

export const metadata: Metadata = {
  title: "Client Portal | Gonza Systems",
  description: "Manage your campaigns and business operations.",
};

import { SidebarProvider } from "@/shared/components/Sidebar";
import { ThemeProvider } from "@/shared/components/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
                <Topbar />
                <main className="p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


