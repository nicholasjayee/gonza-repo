import { cookies } from 'next/headers';

export async function getActiveBranch() {
    const cookieStore = await cookies();
    const branchId = cookieStore.get('activeBranchId')?.value;
    const branchType = cookieStore.get('activeBranchType')?.value as 'MAIN' | 'SUB' | undefined;
    const verifiedId = cookieStore.get('branchVerifiedId')?.value;

    return {
        branchId,
        branchType: branchType || 'SUB',
        isVerified: !!branchId && branchId === verifiedId
    };
}

export async function setActiveBranch(id: string, type: 'MAIN' | 'SUB') {
    const cookieStore = await cookies();
    cookieStore.set('activeBranchId', id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days persistence
    });
    cookieStore.set('activeBranchType', type, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days persistence
    });

    // Also mark as verified in this session
    cookieStore.set('branchVerifiedId', id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    });
}

export async function clearBranchVerification() {
    const cookieStore = await cookies();
    cookieStore.delete({ name: 'branchVerifiedId', path: '/' });
}
