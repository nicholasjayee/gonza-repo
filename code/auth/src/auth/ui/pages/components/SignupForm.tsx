"use client";

import React from 'react';

export default function SignupForm() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    async function handleSignup(formData: FormData) {
        setLoading(true);
        setError('');

        try {
            const { signUpAction } = await import('../../../api/controller');
            const result = await signUpAction(formData);

            if (result.success && result.user) {
                // Role-based redirect
                if (result.user.role === 'superadmin') {
                    window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003';
                } else {
                    window.location.href = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3002';
                }
            } else {
                setError(result.error || 'Signup failed');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-5" action={handleSignup}>
            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                </div>
            )}
            <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Full Name</label>
                <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Corporate Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
                />
            </div>

            <div className="space-y-1.5 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Secure Password</label>
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                            <path d="m2 2 20 20" />
                        </svg>
                    )}
                </button>
            </div>

            <button
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 disabled:opacity-50"
            >
                {loading ? 'Creating Account...' : 'Establish Account'}
            </button>
        </form>
    );
}
