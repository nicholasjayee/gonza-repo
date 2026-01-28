import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

export interface TokenPayload {
    userId: string;
    email: string;
    roleId: string;
    permissions?: string[];
}

export interface RefreshTokenPayload {
    userId: string;
}

/**
 * Generate Access Token (15 minutes)
 * Contains user ID, email, role, and permissions
 */
export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
}

/**
 * Generate Refresh Token (7 days)
 * Only contains user ID for security
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}
