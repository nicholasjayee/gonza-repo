import { NextResponse } from 'next/server';

export const SessionController = {
    async login(credentials: any) {
        console.log('Login attempt:', credentials);
        return NextResponse.json({ success: true, token: 'mock-jwt-token' });
    },
    async logout() {
        return NextResponse.json({ success: true });
    }
};
