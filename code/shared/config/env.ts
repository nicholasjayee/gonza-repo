import 'dotenv/config';

export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    // Subdomain URLs with real domain fallbacks
    WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://gonzasystems.com',
    AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.gonzasystems.com',
    CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://client.gonzasystems.com',
    ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.gonzasystems.com',
    
    // Google Auth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
   
    // Email Configuration
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    SMTP_FROM: process.env.SMTP_FROM || '',
};
