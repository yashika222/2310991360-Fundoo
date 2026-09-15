import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { canAccessNote, isOwner } from '@/lib/noteAccess';
import { cleanCollaborators, cleanLabels, isValidColor } from '@/lib/validators';
import { getAuthUser } from '@/middleware/auth';
import Note from '@/models/Note';

type RouteParams = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    return NextResponse.json(note);
  } catch (error) {
    console.error('GET /api/notes/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteParams): Promise<NextResponse> {
  return PUT(req, context);
}

export async function PUT(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (body.title !== undefined) note.title = String(body.title).trim();
    if (body.description !== undefined) note.description = String(body.description);
    if (body.color !== undefined) {
      if (!isValidColor(body.color)) {
        return NextResponse.json({ error: 'Invalid color code' }, { status: 400 });
      }
      note.color = body.color;
    }
    if (body.labels !== undefined) {
      note.labels = cleanLabels(body.labels);
    }
    if (body.collaborators !== undefined) {
      if (!isOwner(note, user)) {
        return NextResponse.json({ error: 'Only the note owner can manage collaborators' }, { status: 403 });
      }
      note.collaborators = cleanCollaborators(body.collaborators);
    }

    await note.save();
    return NextResponse.json(note);
  } catch (error) {
    console.error('PUT /api/notes/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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
      return NextResponse.json({ error: 'Only the note owner can move it to trash' }, { status: 403 });
    }

    note.isDeleted = true;
    await note.save();

    return NextResponse.json({ message: 'Moved to trash successfully', note });
  } catch (error) {
    console.error('DELETE /api/notes/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
