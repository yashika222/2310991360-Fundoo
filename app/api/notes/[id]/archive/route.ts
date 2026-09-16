import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { archiveNote } from '@/lib/notes';
import { getAuthUser } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const note = await archiveNote(params.id, user);
    if (!note) return NextResponse.json({ error: 'Note not found in main database' }, { status: 404 });

    return NextResponse.json({ message: 'Moved to archive database', note });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
