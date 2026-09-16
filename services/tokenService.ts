import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

function secret() {
  return process.env.JWT_SECRET || 'dev_jwt_secret_change_me_32_chars_min';
}

export function signToken(id: string, email: string) {
  return jwt.sign({ id, email }, secret(), { expiresIn: '24h' });
}

export function verifyToken(token: string) {
  try {
    const data = jwt.verify(token, secret()) as { id: string; email: string };
    if (!data?.id || !data?.email) return null;
    return { id: data.id, email: data.email };
  } catch {
    return null;
  }
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function makeResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hashed: hashToken(token) };
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
