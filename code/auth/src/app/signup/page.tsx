import { Metadata } from "next";
import SignupPage from "@/auth/ui/pages/SignupPage";

export const metadata: Metadata = {
    title: 'Create Account | Gonza Auth',
    description: 'Secure authentication for Gonza Systems.',
    robots: { index: false, follow: false },
};

export default function Page() {
    return <SignupPage />;
}
