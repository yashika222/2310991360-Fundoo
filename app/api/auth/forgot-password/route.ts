import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { isValidEmail } from '@/lib/validators';
import User from '@/models/User';
import { sendResetEmail } from '@/services/emailService';
import { createResetToken } from '@/services/tokenService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await req.json().catch(() => null);

    if (!body || !body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    const successMsg = { message: 'If that email exists, a reset token was generated' };

    if (!user) {
      return NextResponse.json(successMsg);
    }

    const { resetToken, hashed } = createResetToken();
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const emailResult = await sendResetEmail(email, resetToken);

    return NextResponse.json({
      ...successMsg,
      ...(emailResult.preview ? { preview: true, token: emailResult.token } : {}),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
