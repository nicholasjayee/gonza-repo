import React from 'react';
import LoginForm from './components/LoginForm';
import SocialLogin from './components/SocialLogin';
import AuthBanner from '../layout/AuthBanner';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-background font-sans">
            {/* Left Side: Branding/Visual (Hidden on mobile) */}
            <AuthBanner
                title="The future of enterprise"
                highlight="operations management."
                description="Streamline your workflow with our advanced suite of business tools. Designed for reliability, scalability, and speed."
            />

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden mb-10 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">Gonza</span>
                    </div>

                    <div className="mb-8 lg:mb-10 text-left">
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue.</p>
                    </div>

                    <LoginForm />

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground/70 font-bold tracking-widest">Or authenticate via</span></div>
                    </div>

                    <SocialLogin />

                    <p className="mt-12 text-center text-[13px] text-muted-foreground font-medium">
                        Don&apos;t have a corporate account? <a href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Establish one here</a>
                    </p>
                </div >
            </div >
        </div >
    );
}
