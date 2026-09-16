import { NextResponse } from 'next/server';
import { connectDB, dbStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'ok', db: dbStatus(), uptime: process.uptime() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ status: 'down', db: 'disconnected', error: message }, { status: 503 });
  }
}
