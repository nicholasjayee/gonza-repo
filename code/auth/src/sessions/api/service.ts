import { db } from '@gonza/shared/prisma/db';

export class SessionService {
    static async validateCredentials(email: string, password: string) {
        // Mock user for lint/dev purposes
        if (email === 'admin@gonza.com') {
            return { id: 'admin-1', email, name: 'Admin User' };
        }
        return null;
    }

    static async createSession(userId: string) {
        // const token = generateToken();
        // return db.session.create({ data: { userId, token, ... } });
        return { token: 'mock-token' };
    }
}
