import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { env } from '@gonza/shared/config/env';

export async function GET() {
    const client = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        `${env.AUTH_URL}/api/auth/google/callback`
    );

    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
        prompt: 'consent',
    });

    return NextResponse.redirect(url);
}
