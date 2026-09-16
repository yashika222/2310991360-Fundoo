import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { clientKey, rateLimit } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validators';
import User from '@/models/User';
import { setAuthCookie, signToken } from '@/services/tokenService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`login:${clientKey(req)}`)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const parsed = loginSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email }).select('+password');
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password as string))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken(String(user._id), user.email as string);
    const res = NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
    return setAuthCookie(res, token);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
