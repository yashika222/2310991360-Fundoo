import { NextRequest } from 'next/server';
import { verifyToken } from '@/services/tokenService';

export function getAuthUser(req: NextRequest) {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
