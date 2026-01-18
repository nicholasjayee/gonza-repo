import { db } from '@gonza/shared/infra/db';

export class AdminUserService {
    static async getAll() {
        // return db.user.findMany();
        return [];
    }

    static async updateRole(userId: string, role: string) {
        // return db.user.update({ where: { id: userId }, data: { role } });
    }
}
