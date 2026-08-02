import { createAdminClient } from '../../../../lib/supabase/adminClient.js';
import { checkRateLimit, extractClientIp, isValidSessionId } from '../../../../lib/iris/rateLimiter.js';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { logId, log_id, sessionId, session_id, feedback, feedbackNote, feedback_note } = body;

    const targetId = logId || log_id;
    const activeSessionId = sessionId || session_id;
    const score = Number(feedback); // 1 for thumbs up, -1 for thumbs down

    if (!targetId || !activeSessionId || (score !== 1 && score !== -1)) {
      return Response.json(
        { success: false, error: 'Target logId, sessionId, dan feedback (-1/1) wajib diisi' },
        { status: 400 }
      );
    }

    if (!isValidSessionId(activeSessionId)) {
      return Response.json(
        { success: false, error: 'Format session_id tidak valid' },
        { status: 400 }
      );
    }

    // Rate Limiting Protection for Feedback Endpoint
    const clientIp = extractClientIp(request);
    const rateCheck = await checkRateLimit(activeSessionId, clientIp);
    if (!rateCheck.allowed) {
      return Response.json(
        { success: false, error: 'Terlalu banyak permintaan feedback' },
        { status: 429 }
      );
    }

    // Sanitize feedback_note against XSS for future dashboard rendering safety
    const noteRaw = feedbackNote || feedback_note || '';
    const cleanNote = noteRaw.trim().replace(/[<>]/g, '').substring(0, 500);

    const supabase = createAdminClient();

    // IDOR PROTECTION: Update ONLY if id = targetId AND session_id = activeSessionId
    const { data, error } = await supabase
      .from('chat_logs')
      .update({
        feedback: score,
        feedback_note: cleanNote || null,
      })
      .eq('id', targetId)
      .eq('session_id', activeSessionId)
      .select('id');

    if (error || !data || data.length === 0) {
      return Response.json(
        { success: false, error: 'Log tidak ditemukan atau session_id tidak sesuai (Akses Ditolak)' },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      message: 'Feedback berhasil disimpan',
      logId: data[0].id,
    });
  } catch (err) {
    console.error('Feedback API error:', err);
    return Response.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
