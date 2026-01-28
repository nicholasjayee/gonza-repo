import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthService } from '@/auth/api/service';

export async function GET() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
        try {
            await AuthService.logout(refreshToken);
        } catch (error) {
            console.error('Logout error:', error);
        }
        cookieStore.delete({ name: 'accessToken', path: '/' });
        cookieStore.delete({ name: 'refreshToken', path: '/' });
        cookieStore.delete({ name: 'userData', path: '/' });

        // Preserve INTENT (activeBranchId) but clear VERIFICATION
        cookieStore.delete({ name: 'branchVerifiedId', path: '/' });
    }

    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    redirect(websiteUrl);
}
