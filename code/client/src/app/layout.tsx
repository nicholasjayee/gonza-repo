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
import { BranchSwitcher } from "@/branches/ui/components/BranchSwitcher";
import { getActiveBranch } from "@/branches/api/branchContext";
import { OnboardingGuard } from "@/branches/ui/components/OnboardingGuard";
import { SettingsProvider } from "@/settings/api/SettingsContext";
import { getSettingsAction } from "@/settings/api/controller";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { branchType } = await getActiveBranch();
  const settingsRes = await getSettingsAction();
  const initialSettings = settingsRes.success ? settingsRes.data : {};

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <OnboardingGuard>
            <SettingsProvider initialSettings={initialSettings}>
              <SidebarProvider>
                <div className="flex min-h-screen" suppressHydrationWarning>
                  <Sidebar branchSwitcherSlot={<BranchSwitcher />} activeBranchType={branchType} />
                  <div className="flex-1 flex flex-col min-w-0 lg:ml-56" suppressHydrationWarning>
                    <Topbar />
                    <main className="p-4 md:p-6 lg:p-8">
                      {children}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </SettingsProvider>
          </OnboardingGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}


