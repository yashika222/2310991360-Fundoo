import { NextResponse } from 'next/server';
import { openapiSpec } from '@/lib/swagger';

export function GET() {
  return NextResponse.json(openapiSpec);
}
