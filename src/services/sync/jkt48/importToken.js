import 'server-only';
import crypto from 'crypto';

// Secret used to sign import tokens. Prefer a dedicated env var; fall back to
// the service-role key (server-only, always present) so this works without
// extra configuration.
function getSecret() {
  const secret = process.env.IMPORT_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('No secret available for import token signing');
  return secret;
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a signed, time-limited import token bound to an admin id.
 * Payload is not secret (it's readable), integrity is guaranteed by the HMAC.
 */
export function createImportToken(adminId, ttlMs = DEFAULT_TTL_MS) {
  const payload = { sub: String(adminId || 'admin'), exp: Date.now() + ttlMs };
  const payloadPart = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadPart).digest('base64url');
  return `${payloadPart}.${sig}`;
}

/**
 * Verify a token's signature and expiry.
 * @returns {{ valid: boolean, payload?: object, reason?: string }}
 */
export function verifyImportToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, reason: 'malformed' };
  }
  const [payloadPart, sig] = token.split('.');
  if (!payloadPart || !sig) return { valid: false, reason: 'malformed' };

  const expected = crypto.createHmac('sha256', getSecret()).update(payloadPart).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, reason: 'bad signature' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, reason: 'bad payload' };
  }
  if (!payload.exp || Date.now() > payload.exp) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true, payload };
}
