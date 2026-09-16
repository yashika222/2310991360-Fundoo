import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { resetSchema } from '@/lib/validators';
import User from '@/models/User';
import { hashToken } from '@/services/tokenService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const parsed = resetSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Token and password (min 8 chars) are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({
      resetPasswordToken: hashToken(parsed.data.token),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken');

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    user.password = parsed.data.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
