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

    // Eazireach Messaging
    EAZIREACH_API_KEY: process.env.EAZIREACH_API_KEY || '',
    EAZIREACH_ACCOUNT_ID: process.env.EAZIREACH_ACCOUNT_ID || '',

    // Cloudflare R2 Storage
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
    R2_ENDPOINT: process.env.R2_ENDPOINT || '',
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',

    // PesaPal Payment Gateway
    PESAPAL_CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY || '',
    PESAPAL_CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET || '',
    PESAPAL_BASE_URL: process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3/api', // Default to live, but user can override
};
