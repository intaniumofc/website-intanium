import { NextResponse } from 'next/server';

const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 500;
const FETCH_TIMEOUT_MS = 15_000; // 15 seconds — generous for local dev

/**
 * Fetch with retry for transient network errors (ETIMEDOUT, ECONNRESET, etc.)
 */
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'IntaniumWebsite/1.0',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      return res;
    } catch (error) {
      clearTimeout(timeoutId);

      const isRetryable =
        error?.cause?.code === 'ETIMEDOUT' ||
        error?.cause?.code === 'ECONNRESET' ||
        error?.cause?.code === 'ECONNREFUSED' ||
        error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
        (error.name === 'TypeError' && error.message === 'fetch failed');

      if (isRetryable && attempt < retries) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(
          `[media-proxy] Retry ${attempt + 1}/${retries} for ${url} after ${backoff}ms (${error?.cause?.code || error.message})`
        );
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // Not retryable or exhausted retries — rethrow
      throw error;
    }
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mediaUrl = searchParams.get('url');

  if (!mediaUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Security: strict hostname validation for R2 URLs
  const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

  let isAllowedHost = false;
  try {
    const parsed = new URL(mediaUrl);
    if (publicUrlBase) {
      const base = new URL(publicUrlBase);
      isAllowedHost = parsed.hostname === base.hostname;
    }
    if (!isAllowedHost && (/\.r2\.dev$/.test(parsed.hostname))) {
      isAllowedHost = true;
    }
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  if (!isAllowedHost) {
    return new Response('Forbidden: Only R2 domains can be proxied', { status: 403 });
  }

  try {
    const res = await fetchWithRetry(mediaUrl);

    if (!res.ok) {
      return new Response(`Failed to fetch media: ${res.statusText}`, { status: res.status });
    }

    // Copy response headers
    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    const contentLength = res.headers.get('content-length');
    const cacheControl = res.headers.get('cache-control');

    if (contentType) headers.set('content-type', contentType);
    if (contentLength) headers.set('content-length', contentLength);
    
    // Set a long-term cache for images
    headers.set('cache-control', cacheControl || 'public, s-maxage=30, stale-while-revalidate=60');

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    console.error(`[media-proxy] Failed after retries (timeout=${isTimeout}):`, error?.cause?.code || error.message);
    
    return new Response(isTimeout ? 'Request timed out' : 'Internal Server Error', { 
      status: isTimeout ? 504 : 500 
    });
  }
}
