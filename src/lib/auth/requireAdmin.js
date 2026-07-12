import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null, error: NextResponse.json({ error: 'Unauthorized: login required' }, { status: 401 }) };
    }

    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, username, role, permissions')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { user, profile: null, error: NextResponse.json({ error: 'Forbidden: not an admin' }, { status: 403 }) };
    }

    return { user, profile, error: null };
  } catch (err) {
    console.error('requireAdmin error:', err);
    return { user: null, profile: null, error: NextResponse.json({ error: 'Internal auth error' }, { status: 500 }) };
  }
}

export function validateFile(file, { allowedTypes = [], maxBytes = 10 * 1024 * 1024 } = {}) {
  if (!file) return { error: NextResponse.json({ error: 'No file provided' }, { status: 400 }) };
  if (allowedTypes.length && !allowedTypes.some(t => file.type.startsWith(t))) {
    return { error: NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 415 }) };
  }
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
    return { error: NextResponse.json({ error: `File too large (max ${maxMB}MB)` }, { status: 413 }) };
  }
  return { error: null };
}

const ratelimitBuckets = new Map();

export function rateLimit(ip, { key = 'default', max = 5, windowMs = 60000 } = {}) {
  const now = Date.now();
  const bucketKey = `${ip}:${key}`;
  const entry = ratelimitBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  ratelimitBuckets.set(bucketKey, entry);

  if (entry.count > max) {
    return { error: NextResponse.json({ error: 'Too many requests, try again later.' }, { status: 429 }) };
  }

  return { error: null };
}

export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for') || '';
  const ip = xff.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  return ip;
}