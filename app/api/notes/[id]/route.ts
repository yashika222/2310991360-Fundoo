import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getMainNote, trashNote } from '@/lib/notes';
import { noteUpdateSchema } from '@/lib/validators';
import { getAuthUser } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const note = await getMainNote(params.id, user);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return PUT(req, ctx);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = noteUpdateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid note' }, { status: 400 });
    }

    await connectDB();
    const note = await getMainNote(params.id, user);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    if (parsed.data.collaborators && String(note.userId) !== user.id) {
      return NextResponse.json({ error: 'Only the owner can manage collaborators' }, { status: 403 });
    }

    Object.assign(note, parsed.data);
    await note.save();
    return NextResponse.json(note);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const result = await trashNote(params.id, user);
    if (!result) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted from main and archive databases', ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
