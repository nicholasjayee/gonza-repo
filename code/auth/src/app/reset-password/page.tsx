import { Metadata } from "next";
import ResetPasswordPage from "@/auth/ui/pages/ResetPasswordPage";

export const metadata: Metadata = {
    title: 'Reset Password | Gonza Auth',
    description: 'Secure authentication for Gonza Systems.',
    robots: { index: false, follow: false },
};

export default function Page() {
    return <ResetPasswordPage />;
}
