import React from 'react';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import AuthBanner from '../layout/AuthBanner';

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen w-full bg-background font-sans">
            {/* Left Side: Branding/Visual (Hidden on mobile) */}
            <AuthBanner
                title="Security is our"
                highlight="top priority."
                description="Recover your access safely. We follow industry-leading security protocols to ensure your corporate data remains protected."
            />

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 text-left">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden mb-10 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">Gonza</span>
                    </div>

                    <div className="mb-8 lg:mb-10 text-left">
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Forgot Password?</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Enter your email and we&apos;ll send reset instructions.</p>
                    </div>

                    <ForgotPasswordForm />

                    <p className="mt-12 text-center text-[13px] text-muted-foreground font-medium">
                        Remembered your password? <a href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Back to sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
