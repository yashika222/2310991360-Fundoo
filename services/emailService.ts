import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

export type EmailResult = {
  delivered: boolean;
  preview?: boolean;
  token?: string;
};

function getAppUrl(): string {
  return process.env.APP_URL || 'http://localhost:3000';
}

export async function sendResetEmail(to: string, resetToken: string): Promise<EmailResult> {
  const link = `${getAppUrl()}/reset-password?token=${resetToken}`;
  const html = `
    <p>You requested a FundooNotes password reset.</p>
    <p>This token is valid for 1 hour.</p>
    <p><a href="${link}">Reset your password</a></p>
    <p>If the link does not work, use this token:</p>
    <pre>${resetToken}</pre>
  `;

  if (!process.env.SMTP_HOST) {
    logger.warn(`SMTP not configured. Password reset token for ${to}: ${resetToken}`);
    return {
      delivered: false,
      preview: true,
      token: process.env.NODE_ENV === 'production' ? undefined : resetToken,
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'FundooNotes <no-reply@fundoonotes.local>',
    to,
    subject: 'Reset FundooNotes Password',
    html,
  });

  logger.info(`Password reset email sent to ${to}`);
  return { delivered: true };
}
