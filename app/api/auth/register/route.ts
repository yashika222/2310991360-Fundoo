import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { clientKey, rateLimit } from '@/lib/rateLimit';
import { registerSchema } from '@/lib/validators';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`register:${clientKey(req)}`)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const parsed = registerSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const exists = await User.findOne({ email: parsed.data.email });
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await User.create(parsed.data);
    return NextResponse.json(
      { message: 'Registered successfully', user: { id: String(user._id), name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
