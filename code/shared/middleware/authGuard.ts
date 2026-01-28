export function authGuard(
    req: { cookies: { get: (key: string) => { value: string } | undefined } },
    allowedRoles: string[]
): { authorized: boolean; redirectPath?: string; user?: any } {
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

        // 3. Check Role permissions
        // superadmin is implicitly allowed if admin is allowed
        const effectivelyAllowedRoles = allowedRoles.includes('admin')
            ? [...allowedRoles, 'superadmin']
            : allowedRoles;

        if (!effectivelyAllowedRoles.includes(userRole)) {
            return { authorized: false, redirectPath: '/api/auth/login?error=unauthorized' };
        }

        // 4. Check if account is active (default to true for backward compatibility)
        if (userData.isActive === false) {
            return { authorized: false, redirectPath: '/api/auth/login?error=frozen' };
        }

        return { authorized: true, user: userData };
    } catch (e) {
        return { authorized: false, redirectPath: '/api/auth/login' };
    }
}

