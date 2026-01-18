import { NextResponse } from 'next/server';
import { MessagingService } from './service';

export const MessagingController = {
    async sendMessage(data: any) {
        const result = await MessagingService.sendMessage(data);
        return NextResponse.json(result);
    },
    async getLogs() {
        const logs = await MessagingService.fetchLogs();
        return NextResponse.json(logs);
    }
};
