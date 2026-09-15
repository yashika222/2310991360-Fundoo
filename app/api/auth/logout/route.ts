import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/services/tokenService';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  return clearAuthCookie(response);
}
