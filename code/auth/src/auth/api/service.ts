import { db } from '@gonza/shared/prisma/db';
import { hashPassword, verifyPassword } from './password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './jwt';
import { sendPasswordResetEmail } from './email';
import crypto from 'crypto';

export class AuthService {
    /**
     * Register a new user with email and password
     */
    static async register(data: { email: string; password: string; name?: string; roleId?: string }) {
        // Check if user already exists
        const existing = await db.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new Error('User already exists with this email');
        }

        // Default to 'admin' role for new signups
        const adminRole = await db.role.findUnique({
            where: { name: 'admin' },
        });

        if (!adminRole) {
            throw new Error('Default admin role not found');
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const user = await db.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                roleId: adminRole.id, // Use the fetched admin role ID
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        return user;
    }

    /**
     * Authenticate user with email and password
     * Returns access token and refresh token
     */
    static async login(email: string, password: string) {
        // Find user
        const user = await db.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('Your account has been frozen. Please contact administration.');
        }

        // Generate tokens
        const permissions = user.role.permissions.map((p) => p.name);
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            roleId: user.roleId,
            permissions,
        });

        const refreshToken = generateRefreshToken({ userId: user.id });

        // Store refresh token in database
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                isActive: user.isActive,
                permissions,
            },
        };
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshAccessToken(refreshToken: string) {
        // Verify token signature
        const payload = verifyRefreshToken(refreshToken);

        // Check if token exists in database
        const storedToken = await db.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    include: {
                        role: {
                            include: {
                                permissions: true,
                            },
                        },
                    },
                },
            },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new Error('Invalid or expired refresh token');
        }

        // Generate new access token
        const user = storedToken.user;
        if (!user.isActive) {
            throw new Error('Your account has been frozen. Please contact administration.');
        }

        const permissions = user.role.permissions.map((p) => p.name);
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            roleId: user.roleId,
            permissions,
        });

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                isActive: user.isActive,
                permissions,
            },
        };
    }

    /**
     * Logout user by deleting refresh token
     */
    static async logout(refreshToken: string) {
        await db.refreshToken.delete({
            where: { token: refreshToken },
        });
    }

    /**
     * Logout user from all devices by deleting all refresh tokens
     */
    static async logoutAll(userId: string) {
        await db.refreshToken.deleteMany({
            where: { userId },
        });
    }

    /**
     * Link Google account to existing user or create new user
     */
    static async handleGoogleAuth(data: {
        email: string;
        name?: string;
        image?: string;
        googleId: string;
        accessToken: string;
        refreshToken?: string;
    }) {
        console.log('[AuthService] handleGoogleAuth check existing account for googleId:', data.googleId);
        // Check if account already exists
        let account = await db.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: data.googleId,
                },
            },
            include: {
                user: {
                    include: {
                        role: {
                            include: {
                                permissions: true,
                            },
                        },
                    },
                },
            },
        });

        if (account) {
            console.log('[AuthService] Existing account found for user:', account.user.email);
            const user = account.user;

            if (!user.isActive) {
                throw new Error('Your account has been frozen. Please contact administration.');
            }

            const permissions = user.role.permissions.map((p) => p.name);
            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                roleId: user.roleId,
                permissions,
            });

            const refreshToken = generateRefreshToken({ userId: user.id });

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await db.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt,
                },
            });

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.name,
                    isActive: user.isActive,
                    permissions,
                },
            };
        }

        // Check if email already exists (might have password login)
        let user = await db.user.findUnique({
            where: { email: data.email },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!user) {
            // Create new user - need default roleId
            // You'll need to create a default "staff" role first
            console.log('[AuthService] No existing user found for email:', data.email, '. Fetching default "admin" role...');
            const defaultRole = await db.role.findUnique({
                where: { name: 'admin' },
            });

            if (!defaultRole) {
                console.error('[AuthService] CRITICAL: Default "admin" role not found in database!');
                throw new Error('Default role not found. Please create roles first.');
            }
            console.log('[AuthService] Default role found with ID:', defaultRole.id);

            console.log('[AuthService] Creating new user...');
            user = await db.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    image: data.image,
                    emailVerified: true,
                    roleId: defaultRole.id,
                },
                include: {
                    role: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });
            console.log('[AuthService] New user created:', user.id);
        }

        // Link Google account
        console.log('[AuthService] Linking Google account for user:', user.id);
        await db.account.create({
            data: {
                userId: user.id,
                provider: 'google',
                providerAccountId: data.googleId,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            },
        });

        if (!user.isActive) {
            throw new Error('Your account has been frozen. Please contact administration.');
        }

        // Generate our JWT tokens
        const permissions = user.role.permissions.map((p) => p.name);
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            roleId: user.roleId,
            permissions,
        });

        const refreshToken = generateRefreshToken({ userId: user.id });

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                isActive: user.isActive,
                permissions,
            },
        };
    }


    /**
     * Request a password reset
     * Generates a token and sends an email
     */
    static async requestPasswordReset(email: string) {
        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return true to avoid enumerating emails
            return true;
        }

        // Generate secure random token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        // Save token to DB
        await db.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        // Send email
        await sendPasswordResetEmail(email, token);

        return true;
    }

    /**
     * Reset password using token
     */
    static async resetPassword(token: string, newPassword: string) {
        // Find token
        const existingToken = await db.passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            throw new Error('Invalid or expired token');
        }

        if (existingToken.expires < new Date()) {
            throw new Error('Invalid or expired token');
        }

        // Find user
        const user = await db.user.findUnique({
            where: { email: existingToken.email },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user and delete token
        await db.$transaction([
            db.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            db.passwordResetToken.delete({
                where: { id: existingToken.id },
            }),
        ]);

        return true;
    }
}
