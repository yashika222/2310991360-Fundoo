import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/services/tokenService';
import type { AuthUser } from '@/types/api';

export function getAuthUser(req: NextRequest): AuthUser | null {
  const header = req.headers.get('authorization');
  let token: string | undefined;

  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  } else {
    token = req.cookies.get('token')?.value;
  }

  if (!token) return null;
  return verifyAccessToken(token);
}
