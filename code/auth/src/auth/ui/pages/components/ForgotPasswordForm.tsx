"use client";

import React from 'react';

export default function ForgotPasswordForm() {
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

    async function handleForgot(formData: FormData) {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { forgotPasswordAction } = await import('../../../api/controller');
            const result = await forgotPasswordAction(formData);

            if (result.success) {
                setMessage('If an account exists, instructions have been sent.');
            } else {
                setError(result.error || 'Request failed');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-5" action={handleForgot}>
            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                </div>
            )}
            {message && (
                <div className="p-3 text-sm text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg dark:text-green-400">
                    {message}
                </div>
            )}
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

            <button
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 disabled:opacity-50"
            >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
        </form>
    );
}
