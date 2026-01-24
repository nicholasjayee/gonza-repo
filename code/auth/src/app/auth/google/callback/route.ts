import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { env } from '@gonza/shared/config/env';
import { AuthService } from '@/auth/api/service';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(`${env.AUTH_URL}/login?error=Google authentication failed`);
    }

    try {
        const client = new OAuth2Client(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            `${env.AUTH_URL}/auth/google/callback`
        );

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user info
        const userInfoResponse = await client.request<{
            id: string;
            email: string;
            name: string;
            picture: string;
        }>({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        });

        const userInfo = userInfoResponse.data;
        console.log('[Google Auth] User info received:', { email: userInfo.email, id: userInfo.id });

        // Handle authentication in service
        console.log('[Google Auth] Calling handleGoogleAuth...');
        const result = await AuthService.handleGoogleAuth({
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.picture,
            googleId: userInfo.id,
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token || undefined,
        });
        console.log('[Google Auth] handleGoogleAuth successful for:', result.user.email);

        // Set cookies
        const cookieStore = await cookies();

        // CLEAR session verification on NEW LOGIN to force password prompt
        // but KEEP activeBranchId intent so they go back to where they were
        cookieStore.delete({ name: 'branchVerifiedId', path: '/' });

        // ... (rest of cookie settings)
        cookieStore.set('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        });

        cookieStore.set('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Store user info in a separate cookie for client-side access
        cookieStore.set('userData', JSON.stringify(result.user), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Redirect based on role
        const redirectUrl = result.user.role === 'superadmin'
            ? env.ADMIN_URL
            : env.CLIENT_URL;

        console.log('[Google Auth] Successfully authenticated user:', {
            email: result.user.email,
            role: result.user.role,
            redirectUrl,
        });

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('[Google Auth] CRITICAL ERROR during authentication:', error);
        if (error instanceof Error) {
            console.error('[Google Auth] Error Message:', error.message);
            console.error('[Google Auth] Error Stack:', error.stack);
        }
        return NextResponse.redirect(`${env.AUTH_URL}/login?error=Authentication failed`);
    }
}
