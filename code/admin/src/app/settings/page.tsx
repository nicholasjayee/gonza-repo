import { Metadata } from "next";
import SettingsPage from "@/components/settings/ui/pages/SettingsPage";

export const metadata: Metadata = {
    title: 'System Settings | Gonza Admin',
    description: 'Configure global system parameters, integrations, and security policies.',
};

export default function Page() {
    return <SettingsPage />;
}
