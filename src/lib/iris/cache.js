import crypto from 'crypto';
import { createAdminClient } from '../supabase/adminClient.js';

/**
 * Generate SHA256 hash of normalized question
 */
export function hashQuestion(question) {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Get exact match cached answer if available
 */
export async function getExactCache(question) {
  try {
    const qHash = hashQuestion(question);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('qa_cache_exact')
      .select('*')
      .eq('question_hash', qHash)
      .single();

    if (error || !data) return null;

    // Increment hit count asynchronously
    supabase
      .from('qa_cache_exact')
      .update({ hit_count: (data.hit_count || 1) + 1 })
      .eq('question_hash', qHash)
      .then(() => {})
      .catch(() => {});

    return {
      answer: data.answer,
      sources: data.sources || [],
      hitCount: data.hit_count,
    };
  } catch (err) {
    console.warn('Error reading qa_cache_exact:', err);
    return null;
  }
}

/**
 * Save Q&A to exact match cache
 */
export async function setExactCache(question, answer, sources = []) {
  try {
    const qHash = hashQuestion(question);
    const supabase = createAdminClient();

    await supabase.from('qa_cache_exact').upsert(
      {
        question_hash: qHash,
        question: question.trim(),
        answer: answer.trim(),
        sources,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'question_hash' }
    );
  } catch (err) {
    console.warn('Error writing to qa_cache_exact:', err);
  }
}
