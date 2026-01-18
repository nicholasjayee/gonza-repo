import LoginPage from "@/sessions/ui/pages/LoginPage";
import SignupPage from "@/sessions/ui/pages/SignupPage";
import ForgotPasswordPage from "@/sessions/ui/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/sessions/ui/pages/ResetPasswordPage";
import { use } from "react";
import { Metadata } from "next";

// Route Config
const routes: Record<string, React.ComponentType> = {
    'login': LoginPage,
    'signup': SignupPage,
    'forgot-password': ForgotPasswordPage,
    'reset-password': ResetPasswordPage,
};

// SEO Configuration
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const route = slug?.[0] || 'login';

    const titles: Record<string, string> = {
        'login': 'Login',
        'signup': 'Create Account',
        'forgot-password': 'Forgot Password',
        'reset-password': 'Reset Password'
    };

    return {
        title: `${titles[route] || 'Auth'} | Gonza Auth`,
        description: 'Secure authentication for Gonza Systems.',
        robots: { index: false, follow: false },
    };
}

export default function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = use(params);
    const route = slug?.[0];

    // Default to Login if no route is provided (i.e. root /)
    if (!route) {
        return <LoginPage />;
    }

    const PageComponent = routes[route];
    if (PageComponent) {
        return <PageComponent />;
    }

    // Fallback to Login
    return <LoginPage />;
}
