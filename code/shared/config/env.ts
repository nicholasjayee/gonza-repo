export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    // Subdomain URLs with real domain fallbacks
    WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://gonzasystems.com',
    AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.gonzasystems.com',
    CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://client.gonzasystems.com',
    ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.gonzasystems.com',
};
