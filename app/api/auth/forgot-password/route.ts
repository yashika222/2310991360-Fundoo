import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { clientKey, rateLimit } from '@/lib/rateLimit';
import { forgotSchema } from '@/lib/validators';
import User from '@/models/User';
import { sendResetEmail } from '@/services/emailService';
import { makeResetToken } from '@/services/tokenService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`forgot:${clientKey(req)}`, 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const parsed = forgotSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email });
    const message = 'If that email exists, a reset token was generated';
    if (!user) return NextResponse.json({ message });

    const { token, hashed } = makeResetToken();
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendResetEmail(parsed.data.email, token);
    return NextResponse.json({
      message,
      ...(emailResult.preview ? { preview: true, token: emailResult.token } : {}),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
