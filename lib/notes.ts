import { ArchivedNote } from '@/models/ArchivedNote';
import Note from '@/models/Note';

type User = { id: string; email: string };

function ownerFilter(id: string, user: User) {
  return {
    _id: id,
    $or: [{ userId: user.id }, { collaborators: user.email.toLowerCase() }],
  };
}

function ownerOnly(id: string, user: User) {
  return { _id: id, userId: user.id };
}

export async function getMainNote(id: string, user: User) {
  return Note.findOne(ownerFilter(id, user));
}

export async function archiveNote(id: string, user: User) {
  const note = await Note.findOne(ownerOnly(id, user));
  if (!note) return null;

  const payload = note.toObject();
  const Archive = ArchivedNote();
  await Archive.findByIdAndUpdate(note._id, payload, { upsert: true });
  await Note.deleteOne({ _id: note._id });
  return payload;
}

export async function restoreNote(id: string, user: User) {
  const Archive = ArchivedNote();
  const archived = await Archive.findOne(ownerOnly(id, user));
  if (!archived) return null;

  const payload = archived.toObject();
  await Note.findByIdAndUpdate(archived._id, payload, { upsert: true });
  await Archive.deleteOne({ _id: archived._id });
  return payload;
}

export async function trashNote(id: string, user: User) {
  const Archive = ArchivedNote();
  const main = await Note.findOne(ownerOnly(id, user));
  const archived = await Archive.findOne(ownerOnly(id, user));

  if (!main && !archived) return null;

  if (main) await Note.deleteOne({ _id: id });
  if (archived) await Archive.deleteOne({ _id: id });

  return { deleted: true, fromMain: Boolean(main), fromArchive: Boolean(archived) };
}
