import { NextResponse } from 'next/server';
import { SupportService } from './service';

export const SupportController = {
    async getDocs() {
        const docs = await SupportService.fetchDocs();
        return NextResponse.json(docs);
    }
};
