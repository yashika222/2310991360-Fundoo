import mongoose from 'mongoose';
import { makeNoteSchema } from '@/models/Note';

export function ArchivedNote() {
  const dbName = process.env.MONGODB_ARCHIVE_DB || 'fundoonotes_archive';
  const archiveDb = mongoose.connection.useDb(dbName, { useCache: true });
  return archiveDb.models.Note || archiveDb.model('Note', makeNoteSchema());
}
