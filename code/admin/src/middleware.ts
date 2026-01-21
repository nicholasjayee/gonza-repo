import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authGuard } from '../../shared/middleware/authGuard'; // Relative import to shared

export function middleware(request: NextRequest) {
    // Admin App Roles: superadmin ONLY
    const allowedRoles = ['superadmin'];

    const result = authGuard(request, allowedRoles);

    if (!result.authorized) {
        // Redirect to Auth App
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
        return NextResponse.redirect(new URL(authUrl, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
