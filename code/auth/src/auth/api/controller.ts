'use server';

import { cookies } from 'next/headers';
import { AuthService } from './service';

/**
 * Sign up with email and password
 */
export async function signUpAction(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        if (!email || !password) {
            return { success: false, error: 'Missing required fields' };
        }

        const user = await AuthService.register({ email, password, name });

        // Auto-login after registration
        const result = await AuthService.login(email, password);

        const cookieStore = await cookies();

        // CLEAR session verification on NEW LOGIN to force password prompt
        // but KEEP activeBranchId intent so they go back to where they were
        cookieStore.delete({ name: 'branchVerifiedId', path: '/' });

        // Set refresh token in HttpOnly cookie
        cookieStore.set('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // Set basic user info in a non-HttpOnly cookie for the frontend
        cookieStore.set('userData', JSON.stringify({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            isActive: result.user.isActive
        }), {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return {
            success: true,
            accessToken: result.accessToken,
            user: result.user,
        };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
}

/**
 * Sign in with email and password
 */
export async function signInAction(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return { success: false, error: 'Email and password are required' };
        }

        const result = await AuthService.login(email, password);

        const cookieStore = await cookies();

        // CLEAR session verification on NEW LOGIN to force password prompt
        // but KEEP activeBranchId intent so they go back to where they were
        cookieStore.delete({ name: 'branchVerifiedId', path: '/' });

        // Set refresh token in HttpOnly cookie
        cookieStore.set('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // Set basic user info in a non-HttpOnly cookie for the frontend
        cookieStore.set('userData', JSON.stringify({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            isActive: result.user.isActive
        }), {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return {
            success: true,
            accessToken: result.accessToken,
            user: result.user,
        };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'Invalid email or password' };
    }
}

/**
 * Sign out - delete refresh token
 */
export async function signOutAction() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (refreshToken) {
            await AuthService.logout(refreshToken);
            cookieStore.delete({ name: 'refreshToken', path: '/' });
        }

        cookieStore.delete({ name: 'userData', path: '/' });

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: 'Sign out failed' };
    }
}

/**
 * Refresh access token using refresh token from cookie
 */
export async function refreshTokenAction() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return { success: false, error: 'No refresh token found' };
        }

        const result = await AuthService.refreshAccessToken(refreshToken);

        return {
            success: true,
            accessToken: result.accessToken,
            user: result.user,
        };
    } catch (error) {
        console.error('Refresh token error:', error);
        // Delete invalid token
        (await cookies()).delete({ name: 'refreshToken', path: '/' });
        return { success: false, error: 'Session expired, please login again' };
    }
}

/**
 * Request password reset
 */
export async function forgotPasswordAction(formData: FormData) {
    try {
        const email = formData.get('email') as string;

        if (!email) {
            return { success: false, error: 'Email is required' };
        }

        await AuthService.requestPasswordReset(email);

        return { success: true };
    } catch (error) {
        console.error('Forgot password error:', error);
        return { success: false, error: 'Failed to process request' };
    }
}

/**
 * Reset password
 */
export async function resetPasswordAction(formData: FormData) {
    try {
        const token = formData.get('token') as string;
        const password = formData.get('password') as string;

        if (!token || !password) {
            return { success: false, error: 'Missing required fields' };
        }

        await AuthService.resetPassword(token, password);

        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' };
    }
}
