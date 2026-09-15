import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { isValidEmail } from '@/lib/validators';
import User from '@/models/User';
import { setAuthCookie, signAccessToken } from '@/services/tokenService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await req.json().catch(() => null);

    if (!body || !body.email || !body.password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const password = String(body.password);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signAccessToken({ id: String(user._id), email: user.email });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: String(user._id), name: user.name, email: user.email },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
