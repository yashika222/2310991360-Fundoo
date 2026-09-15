import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { cleanCollaborators, cleanLabels, isValidColor } from '@/lib/validators';
import { getAuthUser } from '@/middleware/auth';
import Note from '@/models/Note';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const archived = searchParams.get('archived') === 'true';
    const deleted = searchParams.get('deleted') === 'true';
    const label = searchParams.get('label');

    const query: Record<string, unknown> = {
      $or: [{ userId: user.id }, { collaborators: user.email.toLowerCase() }],
      isDeleted: deleted,
    };

    if (!deleted) {
      query.isArchived = archived;
    }

    if (label) {
      query.labels = label;
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const color = body.color || '#FFFFFF';
    if (!isValidColor(color)) {
      return NextResponse.json({ error: 'Invalid color code' }, { status: 400 });
    }

    const note = await Note.create({
      title: String(body.title).trim(),
      description: body.description ? String(body.description) : '',
      color,
      userId: user.id,
      labels: cleanLabels(body.labels),
      collaborators: cleanCollaborators(body.collaborators),
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
