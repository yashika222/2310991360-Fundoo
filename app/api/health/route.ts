import { NextResponse } from 'next/server';
import { connectDB, getDbState } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    logger.info('Health check ok');
    return NextResponse.json({
      status: 'ok',
      db: getDbState(),
      uptime: process.uptime(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Health check failed: ${message}`);
    return NextResponse.json(
      { status: 'down', db: 'disconnected', error: message },
      { status: 503 }
    );
  }
}
