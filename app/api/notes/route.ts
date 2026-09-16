import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/middleware/auth';
import { ArchivedNote } from '@/models/ArchivedNote';
import Note from '@/models/Note';
import { noteSchema, pageParams } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = pageParams(searchParams);
    const archived = searchParams.get('archived') === 'true';
    const label = searchParams.get('label');

    const filter: Record<string, unknown> = {
      $or: [{ userId: user.id }, { collaborators: user.email.toLowerCase() }],
    };
    if (label) filter.labels = label;

    const Model = archived ? ArchivedNote() : Note;
    const [data, total] = await Promise.all([
      Model.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);

    return NextResponse.json({
      data,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = noteSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid note' }, { status: 400 });
    }

    await connectDB();
    const note = await Note.create({ ...parsed.data, userId: user.id });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
