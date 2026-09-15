import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'fundoo_jwt_secret_key_32_characters_long_12345';
}

export function signAccessToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): { id: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded) {
      return { id: String(decoded.id), email: String(decoded.email) };
    }
    return null;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createResetToken(): { resetToken: string; hashed: string } {
  const resetToken = crypto.randomBytes(32).toString('hex');
  return { resetToken, hashed: hashToken(resetToken) };
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
