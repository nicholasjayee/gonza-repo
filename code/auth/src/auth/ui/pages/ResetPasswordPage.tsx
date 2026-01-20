"use client";

import React from 'react';

export default function ResetPasswordPage() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    // In a real app we'd use useSearchParams here, but for now we'll rely on window or assumption that page is rendered with params
    // HACK: Reading search params from window on client
    const [token, setToken] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setToken(params.get('token') || '');
        }
    }, []);

    async function handleReset(formData: FormData) {
        setLoading(true);
        setError('');

        const password = formData.get('password');
        const confirm = formData.get('confirm_password');

        if (password !== confirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Append token manually since it's not in the form
        formData.append('token', token);

        try {
            const { resetPasswordAction } = await import('../../api/controller');
            const result = await resetPasswordAction(formData);

            if (result.success) {
                setSuccess(true);
                // Optional: Redirect after delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(result.error || 'Reset failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen w-full bg-background font-sans items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground text-green-500">Success!</h2>
                    <p className="text-muted-foreground mt-2 text-sm">Your password has been reset. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-background font-sans">
            {/* Left Side: Branding/Visual (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-neutral-950 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-primary/40 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-blue-600/30 blur-[120px]" />
                </div>
                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">Gonza Systems</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Identity is the new <br />
                            <span className="text-primary italic">perimeter security.</span>
                        </h1>
                        <p className="text-neutral-400 mt-6 max-w-lg text-lg leading-relaxed">
                            Complete your password reset to regain access to your enterprise dashboard. Always use a strong, unique password.
                        </p>
                    </div>
                    <div className="text-neutral-500 text-sm">
                        © 2026 Gonza Systems Global Ltd.
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 text-left">
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden mb-12 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Gonza</span>
                    </div>

                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Set New Password</h2>
                        <p className="text-muted-foreground mt-2 text-sm">Create a strong password to protect your data.</p>
                    </div>

                    <form className="space-y-6" action={handleReset}>
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">New Password</label>
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

                        <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-0.5">Confirm Password</label>
                            <input
                                name="confirm_password"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[34px] p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? (
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
                            disabled={loading || !token}
                            className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-neutral-900 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Secure Password'}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[13px] text-muted-foreground font-medium">
                        Changed your mind? <a href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Back to sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
