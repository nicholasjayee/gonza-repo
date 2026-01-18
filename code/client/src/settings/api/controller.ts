import { NextResponse } from 'next/server';
import { SettingService } from './service';

export const SettingController = {
    async getRoles() {
        const roles = await SettingService.fetchRoles();
        return NextResponse.json(roles);
    }
};
