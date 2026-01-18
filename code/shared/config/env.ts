export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    API_PORT: process.env.API_PORT || 3000,
    IS_DEV: process.env.NODE_ENV === 'development',
};
