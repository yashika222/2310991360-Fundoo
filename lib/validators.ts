const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export const NOTE_COLORS = ['#FFFFFF', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidColor(color: string): boolean {
  return NOTE_COLORS.includes(color as (typeof NOTE_COLORS)[number]);
}

export function cleanLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) return [];
  return Array.from(new Set(labels.map((l) => String(l).trim()).filter(Boolean)));
}

export function cleanCollaborators(collaborators: unknown): string[] {
  if (!Array.isArray(collaborators)) return [];
  const list = collaborators
    .map((c) => String(c).trim().toLowerCase())
    .filter((c) => isValidEmail(c));
  return Array.from(new Set(list)).slice(0, 10);
}
