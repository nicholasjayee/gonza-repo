import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authGuard } from '../../shared/middleware/authGuard'; // Relative import to shared

export function middleware(request: NextRequest) {
    // Client App Roles: admin, manager, superadmin
    const allowedRoles = ['admin', 'manager', 'superadmin'];

    const result = authGuard(request, allowedRoles);

    if (!result.authorized) {
        // Redirect to Auth App
        // NOTE: Hardcoded localhost for now as per env vars, but ideally should use env var
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
        return NextResponse.redirect(new URL(authUrl, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
