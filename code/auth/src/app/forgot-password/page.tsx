import { Metadata } from "next";
import ForgotPasswordPage from "@/auth/ui/pages/ForgotPasswordPage";

export const metadata: Metadata = {
    title: 'Forgot Password | Gonza Auth',
    description: 'Secure authentication for Gonza Systems.',
    robots: { index: false, follow: false },
};

export default function Page() {
    return <ForgotPasswordPage />;
}
