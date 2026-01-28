import { Metadata } from "next";
import LoginPage from "@/auth/ui/pages/LoginPage";

export const metadata: Metadata = {
    title: 'Login | Gonza Auth',
    description: 'Secure authentication for Gonza Systems.',
    robots: { index: false, follow: false },
};

export default function Page() {
    return <LoginPage />;
}
