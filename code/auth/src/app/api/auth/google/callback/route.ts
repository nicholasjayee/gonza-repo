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
            `${env.AUTH_URL}/api/auth/google/callback`
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

        // Handle authentication in service
        const result = await AuthService.handleGoogleAuth({
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.picture,
            googleId: userInfo.id,
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token || undefined,
        });

        const cookieStore = await cookies();

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
            role: result.user.role
        }), {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        // Role-based redirect
        const redirectUrl = result.user.role === 'superadmin'
            ? env.ADMIN_URL
            : env.CLIENT_URL;

        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error('Google callback error:', error);
        return NextResponse.redirect(`${env.AUTH_URL}/login?error=Google authentication failed`);
    }
}
