import type { INote } from '@/models/Note';
import type { AuthUser } from '@/types/api';

export function isOwner(note: INote, user: AuthUser): boolean {
  return String(note.userId) === String(user.id);
}

export function canAccessNote(note: INote, user: AuthUser): boolean {
  return isOwner(note, user) || note.collaborators.includes(user.email.toLowerCase());
}
