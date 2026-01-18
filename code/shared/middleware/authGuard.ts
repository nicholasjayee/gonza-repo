// This is a global shared middleware function
export async function authGuard(req: Request) {
    // Example: Check for a session cookie or token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return { authorized: false, reason: 'No authorization header' };
    }
    return { authorized: true };
}
