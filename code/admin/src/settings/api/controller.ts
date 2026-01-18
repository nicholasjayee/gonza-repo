'use server';

import { AdminSettingService } from './service';

export async function getSystemConfigAction() {
    try {
        const data = await AdminSettingService.getSystemConfig();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
