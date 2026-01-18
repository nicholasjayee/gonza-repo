'use server';

import { SessionService } from './service';

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await SessionService.validateCredentials(email, password);
    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }

    const session = await SessionService.createSession(user.id);
    return { success: true, token: session.token };
}

export async function signupAction(formData: FormData) {
    // Process signup
    return { success: true };
}
