export function authGuard(
    req: { cookies: { get: (key: string) => { value: string } | undefined } },
    allowedRoles: string[]
): { authorized: boolean; redirectPath?: string } {
    // 1. Check for Refresh Token (Session)
    const refreshToken = req.cookies.get('refreshToken');
    if (!refreshToken) {
        return { authorized: false, redirectPath: '/api/auth/login' }; // Redirect to Auth
    }

    // 2. Check Role permissions
    const userDataCookie = req.cookies.get('userData');
    if (!userDataCookie) {
        // Session exists but no user data? Weird, likely needs re-login or just failed fetch.
        // For safety, assume unauthorized or let it pass if we only care about auth existence?
        // Better to be strict.
        return { authorized: false, redirectPath: '/api/auth/login' };
    }

    try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.value));
        const userRole = userData.role || 'user';

        if (!allowedRoles.includes(userRole)) {
            // User is logged in but doesn't have permission
            // Redirect to a "Forbidden" page or back to their likely home?
            // For now, redirect to Auth which might redirect them back to their allowed app if smart,
            // or just 403. Let's redirect to the Auth app root or login.
            return { authorized: false, redirectPath: '/api/auth/login?error=unauthorized' };
        }
    } catch (e) {
        return { authorized: false, redirectPath: '/api/auth/login' };
    }

    return { authorized: true };
}
