'use server';

import { SettingService } from './service';

export async function getSettingsAction() {
    try {
        const data = await SettingService.getSettings();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
