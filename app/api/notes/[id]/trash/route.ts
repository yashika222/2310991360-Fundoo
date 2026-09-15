import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { canAccessNote, isOwner } from '@/lib/noteAccess';
import { getAuthUser } from '@/middleware/auth';
import Note from '@/models/Note';

type RouteParams = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const note = await Note.findById(params.id);
    if (!note || !canAccessNote(note, user)) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (!isOwner(note, user)) {
      return NextResponse.json({ error: 'Only the note owner can trash it' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const isDeleted = body && body.isDeleted !== undefined ? Boolean(body.isDeleted) : true;

    note.isDeleted = isDeleted;
    await note.save();

    return NextResponse.json(note);
  } catch (error) {
    console.error('PATCH /trash error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
