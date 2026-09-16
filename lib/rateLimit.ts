const hits = new Map<string, { count: number; start: number }>();

export function rateLimit(key: string, max = 20, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const current = hits.get(key);

  if (!current || now - current.start > windowMs) {
    hits.set(key, { count: 1, start: now });
    return true;
  }

  current.count += 1;
  return current.count <= max;
}

export function clientKey(req: Request) {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local';
}
