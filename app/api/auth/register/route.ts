import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { isValidEmail } from '@/lib/validators';
import User from '@/models/User';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await req.json().catch(() => null);

    if (!body || !body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const name = String(body.name).trim();
    const email = String(body.email).trim().toLowerCase();
    const password = String(body.password);

    if (name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const user = await User.create({ name, email, password });

    return NextResponse.json(
      {
        message: 'Registered successfully',
        user: { id: String(user._id), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
