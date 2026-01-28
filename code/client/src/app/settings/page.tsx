import { Metadata } from "next";
import SettingsPage from "@/settings/ui/pages/SettingsPage";

export const metadata: Metadata = {
    title: 'Settings | Gonza Client',
    description: 'Configure your account preferences, integrations, and system settings.',
};

export default function Page() {
    return <SettingsPage />;
}
