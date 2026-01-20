import nodemailer from 'nodemailer';
import { env } from '@gonza/shared/config/env';

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${env.AUTH_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: env.SMTP_FROM,
        to: email,
        subject: 'Reset Your Password',
        text: `Hello,\n\nYou have requested to reset your password.\nPlease click the link below to verify your identity and set a new password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password. Please click the button below to verify your identity and set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; rounded-md: 8px; font-weight: bold; border-radius: 8px;">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 14px;">${resetLink}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
}
