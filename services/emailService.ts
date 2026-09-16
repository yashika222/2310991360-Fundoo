import { logger } from '@/lib/logger';
import nodemailer from 'nodemailer';

export async function sendResetEmail(to: string, token: string) {
  if (!process.env.SMTP_HOST) {
    logger.warn(`SMTP not set. Reset token for ${to}: ${token}`);
    return { delivered: false, preview: true, token: process.env.NODE_ENV === 'production' ? undefined : token };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'FundooNotes <no-reply@localhost>',
    to,
    subject: 'Reset FundooNotes Password',
    text: `Reset token (1 hour): ${token}`,
  });

  return { delivered: true };
}
