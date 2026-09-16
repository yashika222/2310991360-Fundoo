import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { trashNote } from '@/lib/notes';
import { getAuthUser } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const result = await trashNote(params.id, user);
    if (!result) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    return NextResponse.json({
      message: 'Permanently deleted from main and archive databases',
      ...result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
