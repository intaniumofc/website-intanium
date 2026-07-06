import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mediaUrl = searchParams.get('url');

  if (!mediaUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Security: only proxy R2 URLs to avoid open proxy vulnerability
  const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
  const isAllowedHost = mediaUrl.includes('.r2.dev') || (publicUrlBase && mediaUrl.startsWith(publicUrlBase));
  
  if (!isAllowedHost) {
    return new Response('Forbidden: Only R2 domains can be proxied', { status: 403 });
  }

  const controller = new AbortController();
  // 3.5 seconds fail-fast timeout
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(mediaUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

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
    headers.set('cache-control', cacheControl || 'public, max-age=31536000, immutable');

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError';
    console.error(`Error proxying media (timeout=${isTimeout}):`, error);
    
    // Return 404 on timeout/network failure to let client handle image fallback
    return new Response(isTimeout ? 'Request timed out' : 'Internal Server Error', { 
      status: isTimeout ? 504 : 500 
    });
  }
}
