import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'FundooNotes API',
    version: '1.0.0',
    status: 'online',
  });
}
