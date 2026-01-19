import { db } from '@gonza/shared/prisma/db';

export class SettingService {
    static async getSettings() {
        // return db.setting.findFirst();
        return {};
    }
}
