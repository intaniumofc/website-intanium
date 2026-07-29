import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createImportToken } from '@/services/sync/jkt48/importToken';

// Session-protected: returns a signed import token + our API origin so the
// admin UI can build the bookmarklet. The token is what authenticates the
// cross-origin import calls made from the jkt48.com page.
export async function GET(request) {
  const { user, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const token = createImportToken(user.id);
    const apiBase = request.nextUrl.origin;
    return NextResponse.json({ success: true, token, apiBase });
  } catch (err) {
    console.error('Error in GET /api/admin/schedule/bookmarklet:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
