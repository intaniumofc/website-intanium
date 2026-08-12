import { getExactCache, setExactCache } from '../../../lib/iris/cache.js';
import { detectIntent } from '../../../lib/iris/intent.js';
import { retrieveContext } from '../../../lib/iris/retrieval.js';
import { buildPrompt } from '../../../lib/iris/prompt.js';
import { streamGeminiContent, generateFallbackAnswer } from '../../../lib/iris/gemini.js';
import { streamFireworksContent } from '../../../lib/iris/fireworks.js';
import { SYSTEM_PROMPT } from '../../../lib/iris/prompt.js';
import { checkRateLimit, extractClientIp } from '../../../lib/iris/rateLimiter.js';
import { checkPrivacyGuard } from '../../../lib/iris/privacyGuard.js';
import { checkSmalltalk } from '../../../lib/iris/smalltalk.js';
import { validateAction } from '../../../lib/iris/actions.js';
import { createAdminClient } from '../../../lib/supabase/adminClient.js';

export async function POST(request) {
  const startTime = performance.now();

  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || body.question || '';
    const sessionId = body.sessionId || body.session_id || 'anonymous-session';
    const pageContext = body.pageContext || {};
    const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages : [];

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return Response.json(
        { success: false, error: 'Pesan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // 1. Persistent Rate Limiting (Sanitized IP + Strict Session Validation)
    const clientIp = extractClientIp(request);
    const rateCheck = await checkRateLimit(sessionId, clientIp);

    if (!rateCheck.allowed) {
      if (rateCheck.invalidSessionId) {
        return Response.json(
          { success: false, error: 'Format session_id tidak valid' },
          { status: 400 }
        );
      }

      return Response.json(
        {
          success: false,
          error: `Terlalu banyak permintaan. Silakan tunggu ${rateCheck.retryAfterSeconds} detik lagi.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const supabase = createAdminClient();

    const safeWriteLog = async (logPayload) => {
      try {
        const { error, data } = await supabase.from('chat_logs').insert(logPayload).select('id').single();
        if (error && error.message?.includes('ip_address')) {
          const fallbackPayload = { ...logPayload };
          delete fallbackPayload.ip_address;
          const res = await supabase.from('chat_logs').insert(fallbackPayload).select('id').single();
          return res.data?.id;
        }
        return data?.id;
      } catch (e) {
        console.warn('Could not write chat_log:', e);
        return null;
      }
    };

    // 1.5 PRIVACY GUARD CHECK
    const privacyCheck = checkPrivacyGuard(cleanMessage);
    if (privacyCheck.triggered) {
      const latencyMs = Math.round(performance.now() - startTime);

      const logId = await safeWriteLog({
        session_id: sessionId,
        ip_address: clientIp,
        question: cleanMessage,
        intent: 'PRIVACY_REFUSED',
        answer: privacyCheck.message,
        sources: [],
        latency_ms: latencyMs,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', content: privacyCheck.message })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                cached: false,
                sources: [],
                latency_ms: latencyMs,
                log_id: logId,
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Privacy-Refused': 'true',
        },
      });
    }

    // 1.6 SMALLTALK & GREETING CHECK
    const smalltalkCheck = checkSmalltalk(cleanMessage);
    if (smalltalkCheck.triggered) {
      const latencyMs = Math.round(performance.now() - startTime);

      const logId = await safeWriteLog({
        session_id: sessionId,
        ip_address: clientIp,
        question: cleanMessage,
        intent: smalltalkCheck.intent,
        answer: smalltalkCheck.message,
        sources: [],
        latency_ms: latencyMs,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', content: smalltalkCheck.message })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                cached: false,
                sources: [],
                latency_ms: latencyMs,
                log_id: logId,
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 2. PATH A: Exact-Match Cache Hit
    const cached = await getExactCache(cleanMessage);
    if (cached) {
      const latencyMs = Math.round(performance.now() - startTime);

      const logId = await safeWriteLog({
        session_id: sessionId,
        ip_address: clientIp,
        question: cleanMessage,
        intent: 'EXACT_CACHE',
        answer: cached.answer,
        sources: cached.sources,
        latency_ms: latencyMs,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', content: cached.answer })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                cached: true,
                sources: cached.sources,
                latency_ms: latencyMs,
                log_id: logId,
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Cache-Hit': 'true',
          'X-Latency-Ms': String(latencyMs),
        },
      });
    }

    // 3. Intent Detection & Action Resolution
    const apiKey = process.env.GEMINI_API_KEY;
    const intentObj = await detectIntent(cleanMessage, apiKey);

    // SERVER-SIDE STRICT ACTION VALIDATION
    let validatedAction = null;
    let rejectedReason = null;

    if (intentObj.action) {
      const actionVal = await validateAction(intentObj.action);
      if (actionVal.valid) {
        validatedAction = actionVal.action;
      } else {
        rejectedReason = actionVal.reason;
        console.warn(`Action "${JSON.stringify(intentObj.action)}" DITOLAK server-side: ${actionVal.reason}`);
      }
    }

    // 4. Retrieval Engine
    const retrievedDocs = await retrieveContext(cleanMessage, intentObj);

    // If 0 documents retrieved AND Gemini API Key is missing: return friendly static fallback
    if (retrievedDocs.length === 0 && !apiKey) {
      const latencyMs = Math.round(performance.now() - startTime);
      const oobAnswer = 'Maaf ya, aku belum menemukan data mengenai pertanyaan tersebut di database IRIS saat ini.';

      const logId = await safeWriteLog({
        session_id: sessionId,
        ip_address: clientIp,
        question: cleanMessage,
        intent: intentObj.intent || 'OUT_OF_BOUNDS',
        answer: oobAnswer,
        sources: [],
        latency_ms: latencyMs,
        feedback_note: rejectedReason ? `[REJECTED_ACTION]: ${rejectedReason}` : null,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          if (validatedAction) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'action', action: validatedAction })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', content: oobAnswer })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                cached: false,
                sources: [],
                latency_ms: latencyMs,
                log_id: logId,
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const sources = retrievedDocs.map((doc) => ({
      id: doc.id,
      source_table: doc.source_table,
      title: doc.title,
      url: doc.url,
    }));

    // 5. Prompt Builder (with structural XML sandboxing & session memory)
    const promptText = buildPrompt(cleanMessage, retrievedDocs, pageContext, recentMessages);

    // 6. PATH C: Streaming Gemini / Fallback Response
    const encoder = new TextEncoder();
    let fullAnswerText = '';
    let isFallbackLLM = false;

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'metadata',
              intent: intentObj.intent,
              sources,
            })}\n\n`
          )
        );

        if (validatedAction) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'action',
                action: validatedAction,
              })}\n\n`
            )
          );
        }

        try {
          const fireworksApiKey = process.env.FIREWORKS_API_KEY;
          
          if (fireworksApiKey) {
            try {
              fullAnswerText = await streamFireworksContent(
                promptText,
                SYSTEM_PROMPT,
                fireworksApiKey,
                (chunk) => {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`
                    )
                  );
                }
              );
            } catch (fireworksErr) {
              console.warn('Fireworks API failed, falling back to Gemini:', fireworksErr.message);
              // Fallback to Gemini
              if (apiKey) {
                fullAnswerText = await streamGeminiContent(
                  promptText,
                  apiKey,
                  (chunk) => {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`
                      )
                    );
                  }
                );
              } else {
                isFallbackLLM = true;
                fullAnswerText = generateFallbackAnswer(cleanMessage, retrievedDocs);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'token', content: fullAnswerText })}\n\n`
                  )
                );
              }
            }
          } else if (apiKey) {
            fullAnswerText = await streamGeminiContent(
              promptText,
              apiKey,
              (chunk) => {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`
                  )
                );
              }
            );
          } else {
            isFallbackLLM = true;
            fullAnswerText = generateFallbackAnswer(cleanMessage, retrievedDocs);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'token', content: fullAnswerText })}\n\n`
              )
            );
          }
        } catch (err) {
          console.error('LLM streaming error, using static fallback:', err.message);
          isFallbackLLM = true;
          fullAnswerText = generateFallbackAnswer(cleanMessage, retrievedDocs);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'token', content: fullAnswerText })}\n\n`
            )
          );
        }

        const latencyMs = Math.round(performance.now() - startTime);

        // Background Async Operations (Write Chat Log & Cache)
        const recordedIntent = isFallbackLLM
          ? `FALLBACK_NO_LLM_${intentObj.intent || 'GENERAL'}`
          : intentObj.intent;

        const logId = await safeWriteLog({
          session_id: sessionId,
          ip_address: clientIp,
          question: cleanMessage,
          intent: recordedIntent,
          answer: fullAnswerText,
          sources,
          latency_ms: latencyMs,
          feedback_note: rejectedReason ? `[REJECTED_ACTION]: ${rejectedReason}` : null,
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              cached: false,
              sources,
              latency_ms: latencyMs,
              log_id: logId,
            })}\n\n`
          )
        );
        controller.close();

        if (fullAnswerText) {
          setExactCache(cleanMessage, fullAnswerText, sources);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in /api/chat route:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
        latency_ms: Math.round(performance.now() - startTime),
      },
      { status: 500 }
    );
  }
}
