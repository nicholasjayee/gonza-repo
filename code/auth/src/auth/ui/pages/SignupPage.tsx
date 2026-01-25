import React from 'react';
import SignupForm from './components/SignupForm';
import SocialSignup from './components/SocialSignup';
import AuthBanner from '../layout/AuthBanner';

export default function SignupPage() {
    return (
        <div className="flex min-h-screen w-full bg-background font-sans">
            {/* Left Side: Branding/Visual (Hidden on mobile) */}
            <AuthBanner
                title="Scale your business"
                highlight="with confidence."
                description="Join thousands of enterprises using Gonza Systems to manage their global operations and customer engagement."
            />

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden mb-12 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">Gonza</span>
                    </div>

                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Account</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Start your 14-day enterprise trial today.</p>
                    </div>

                    <SignupForm />

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground/70 font-bold tracking-widest">Or sign up via</span></div>
                    </div>

                    <SocialSignup />

                    <p className="mt-12 text-center text-[13px] text-muted-foreground font-medium">
                        Already have an account? <a href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Sign in here</a>
                    </p>
                </div>
            </div>
        </div >
    );
}
