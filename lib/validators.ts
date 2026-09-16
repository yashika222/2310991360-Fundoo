import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export const noteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().default(''),
  color: z.enum(['#FFFFFF', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3']).optional().default('#FFFFFF'),
  labels: z.array(z.string()).optional().default([]),
  collaborators: z.array(z.string().email()).max(10).optional().default([]),
});

export const noteUpdateSchema = noteSchema.partial();

export function pageParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
