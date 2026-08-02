import { createAdminClient } from '../supabase/adminClient.js';

const inMemoryMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

/**
 * Validate session_id format (alphanumeric, hyphen, underscore, 1-64 chars)
 */
export function isValidSessionId(sessionId) {
  if (typeof sessionId !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(sessionId.trim());
}

/**
 * Extract and sanitize client IP from Next.js / Vercel request headers
 */
export function extractClientIp(request) {
  const rawHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  // Take first IP if comma-separated list
  const firstIp = rawHeader.split(',')[0].trim();
  // Sanitize IP (IPv4 or IPv6 chars only)
  const cleanIp = firstIp.replace(/[^a-fA-F0-9:.]/g, '');
  return cleanIp || '127.0.0.1';
}

/**
 * Serverless-compatible Persistent Rate Limiter with Strict Parameter Binding & IP/Session Isolation
 *
 * KNOWN TECHNICAL DEBT:
 * Check-then-insert query is non-atomic (race condition possible under simultaneous parallel bursts).
 * Acceptable limitation for fan site scale.
 */
export async function checkRateLimit(sessionId, clientIp) {
  const cleanSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';

  // 1. Strict validation of sessionId format
  if (!isValidSessionId(cleanSessionId)) {
    return {
      allowed: false,
      invalidSessionId: true,
      error: 'Format session_id tidak valid',
      remaining: 0,
      retryAfterSeconds: 0,
    };
  }

  const cleanIp = (clientIp || '127.0.0.1').replace(/[^a-fA-F0-9:.]/g, '');
  const now = Date.now();
  const windowStart = new Date(now - WINDOW_MS).toISOString();

  // 2. In-memory fast path check (tracked separately by IP and Session)
  const memKeyIp = `ip_${cleanIp}`;
  const memKeySession = `session_${cleanSessionId}`;

  const memDataIp = inMemoryMap.get(memKeyIp) || { requests: [] };
  const memDataSession = inMemoryMap.get(memKeySession) || { requests: [] };

  const validIpReqs = memDataIp.requests.filter((t) => now - t < WINDOW_MS);
  const validSessionReqs = memDataSession.requests.filter((t) => now - t < WINDOW_MS);

  if (validIpReqs.length >= MAX_REQUESTS || validSessionReqs.length >= MAX_REQUESTS) {
    const oldest = validIpReqs[0] || validSessionReqs[0] || now;
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // 3. Persistent Supabase DB check with TWO SEPARATE PARAMETERIZED BINDINGS (Immune to SQL/PostgREST filter injection)
  try {
    const supabase = createAdminClient();

    const [ipRes, sessionRes] = await Promise.all([
      supabase
        .from('chat_logs')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', cleanIp)
        .gte('created_at', windowStart),
      supabase
        .from('chat_logs')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', cleanSessionId)
        .gte('created_at', windowStart),
    ]);

    const ipCount = ipRes.count || 0;
    const sessionCount = sessionRes.count || 0;
    const maxCount = Math.max(ipCount, sessionCount, validIpReqs.length, validSessionReqs.length);

    if (maxCount >= MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 60,
      };
    }
  } catch (err) {
    console.warn('DB rate limit check fallback to in-memory:', err.message);
  }

  // Record in memory
  validIpReqs.push(now);
  validSessionReqs.push(now);
  inMemoryMap.set(memKeyIp, { requests: validIpReqs });
  inMemoryMap.set(memKeySession, { requests: validSessionReqs });

  return {
    allowed: true,
    remaining: MAX_REQUESTS - Math.max(validIpReqs.length, validSessionReqs.length),
    retryAfterSeconds: 0,
  };
}
